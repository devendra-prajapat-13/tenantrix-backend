import { User } from "../../models/user.schema.js";
import { Organization } from "../../models/organization.schema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  successResponse,
  errorResponse,
} from "../../utils/helper/apiResponse.js";
import { STATUS_CODES } from "../../utils/helper/statusCodes.js";
import { USER_ROLES } from "../../services/enum/enum.js";
import { OTP } from "../../models/otp.schema.js";
import { sendMail } from "../../services/mailer/mail.service.js";
import { generateOTP } from "../../utils/helper/otp.js";
import {
  welcomeTemplate,
  otpTemplate,
  resetPasswordTemplate,
  passwordResetSuccessTemplate,
} from "../../services/mailer/templates/email.template.js";
import { PasswordReset } from "../../models/resetPassword.schema.js";
import crypto from "crypto";
import logger from "../../logger.js";

export const register = async (req, res) => {
  try {
    const { name, email, password, organizationName } = req.body;

    if (
      !name?.trim() ||
      !email?.trim() ||
      !password?.trim() ||
      !organizationName?.trim()
    ) {
      return errorResponse(
        res,
        STATUS_CODES.BAD_REQUEST,
        "All fields are required",
      );
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return errorResponse(
        res,
        STATUS_CODES.CONFLICT,
        "Email already registered",
      );
    }

    const slug = organizationName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");

    const existingOrg = await Organization.findOne({ slug });
    if (existingOrg) {
      return errorResponse(
        res,
        STATUS_CODES.CONFLICT,
        "Organization name already in use",
      );
    }

    const organization = await Organization.create({
      name: organizationName,
      slug,
      ownerId: null,
    });

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: USER_ROLES.OWNER,
      organizationName:organizationName,
      organizationId: organization._id,
      isActive: false,
    });
    
    organization.ownerId = user._id;
    await organization.save();

    // generate OTP
    const otpCode = generateOTP();
    const hashedOtp = await bcrypt.hash(otpCode, salt);

    await OTP.create({
      email,
      otp: hashedOtp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    const otpHTML = otpTemplate(otpCode, name);
    await sendMail(email, "Verify your Tenantrix Account", otpHTML);

    return successResponse(
      res,
      STATUS_CODES.CREATED,
      "Registration successful. Please verify OTP sent to your Email",
      {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          organizationId: user.organizationId,
          role: user.role,
          isActive: user.isActive,
        },
      },
    );
  } catch (error) {
    console.error(error);
    return errorResponse(
      res,
      STATUS_CODES.INTERNAL_SERVER_ERROR,
      "Something went wrong",
    );
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return errorResponse(
        res,
        STATUS_CODES.BAD_REQUEST,
        "Email and password are required",
      );
    }
    const user = await User.findOne({ email });
    if (!user) {
      return errorResponse(res, STATUS_CODES.UNAUTHORIZED, "User not found");
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return errorResponse(
        res,
        STATUS_CODES.UNAUTHORIZED,
        "Invalid credentials",
      );
    }

    const token = generateToken({
      userId: user._id,
      organizationId: user.organizationId,
    });

    return successResponse(
      res,
      STATUS_CODES.OK,
      "Login successful",
      {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          organizationId: user.organizationId,
          role: user.role,
          isActive: user.isActive,
        },
      },
      { token },
    );
  } catch (error) {
    console.error(error);

    return errorResponse(
      res,
      STATUS_CODES.INTERNAL_SERVER_ERROR,
      "Login failed",
    );
  }
};

export const checkUserActive = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return errorResponse(res, STATUS_CODES.BAD_REQUEST, "Email is required");
    }
    const user = await User.findOne({ email });
    if (!user) {
      return errorResponse(res, STATUS_CODES.NOT_FOUND, "User not found");
    }
    if (user.isActive) {
      return successResponse(res, STATUS_CODES.OK, "User account already verified", {
        isActive: true,
      });
    }

    // resend OTP
    await OTP.deleteMany({ email });

    const otpCode = generateOTP();
    const salt = await bcrypt.genSalt(12);
    const hashedOtp = await bcrypt.hash(otpCode, salt);

    await OTP.create({
      email,
      otp: hashedOtp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    const otpHTML = otpTemplate(otpCode, user.name);
    await sendMail(email, "Verify your Tenantrix Account", otpHTML);

    return successResponse(
      res,
      STATUS_CODES.OK,
      "Account not verified. OTP sent to your email",
      { isActive: false },
    );
  } catch (error) {
    console.error(error);

    return errorResponse(
      res,
      STATUS_CODES.INTERNAL_SERVER_ERROR,
      "Something went wrong",
    );
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Basic validation
    if (!email || !otp) {
      return errorResponse(
        res,
        STATUS_CODES.BAD_REQUEST,
        "Email and OTP are required",
      );
    }
    // Find OTP record by email (NOT by otp)
    const record = await OTP.findOne({ email });
    if (!record) {
      return errorResponse(res, STATUS_CODES.BAD_REQUEST, "Invalid email");
    }
    // Check expiry
    if (record.expiresAt < new Date()) {
      return errorResponse(res, STATUS_CODES.BAD_REQUEST, "OTP expired");
    }
    // Compare hashed OTP
    const isMatch = await bcrypt.compare(otp, record.otp);
    if (!isMatch) {
      return errorResponse(res, STATUS_CODES.BAD_REQUEST, "Invalid OTP");
    }
    // Activate user account
    const user = await User.findOneAndUpdate(
      { email },
      { isActive: true },
      { new: true },
    );
    if (!user) {
      return errorResponse(res, STATUS_CODES.NOT_FOUND, "User not found");
    }

    const welcomeHTML = welcomeTemplate({
      firstName: user.name,
      organizationName: user.organizationName,
      dashboardUrl: `${process.env.FRONTEND_URL}/dashboard`,
      userEmail: user.email,
      planName: "Free",
      workspaceUrl: `http://${user.organizationName}.${process.env.APP_DOMAIN}`,
      companyAddress: "Indore, India",
      companyWebsite: process.env.FRONTEND_URL,
    });

    await sendMail(
      user.email,
      "Welcome to Tenantrix – Your Workspace is Ready",
      welcomeHTML,
    );
    // Delete OTP after success
    await OTP.deleteMany({ email });
    return successResponse(
      res,
      STATUS_CODES.OK,
      "Account verified successfully",
    );
  } catch (error) {
    console.error(error);
    return errorResponse(
      res,
      STATUS_CODES.INTERNAL_SERVER_ERROR,
      "Verification failed",
    );
  }
};

export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return errorResponse(res, STATUS_CODES.BAD_REQUEST, "Email is required");
    }
    // check user
    const user = await User.findOne({ email });
    if (!user) {
      return errorResponse(res, STATUS_CODES.NOT_FOUND, "User not found");
    }
    // already verified
    if (user.isActive) {
      return errorResponse(
        res,
        STATUS_CODES.BAD_REQUEST,
        "User already verified",
      );
    }
    // delete previous OTPs (clean approach)
    await OTP.deleteMany({ email });
    // generate new otp
    const otpCode = generateOTP();
    const saltKey = await bcrypt.genSalt(12);
    const hashedOtp = await bcrypt.hash(otpCode, saltKey);
    await OTP.create({
      email,
      otp: hashedOtp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });
    // send email
    const otpHTML = otpTemplate(otpCode, user.name);
    await sendMail(email, "Resend OTP - Verify your Account", otpHTML);
    return successResponse(res, STATUS_CODES.OK, "OTP resent successfully");
  } catch (error) {
    console.error(error);
    return errorResponse(
      res,
      STATUS_CODES.INTERNAL_SERVER_ERROR,
      "Failed to resend OTP",
    );
  }
};

export const verifyToken = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      return errorResponse(res, STATUS_CODES.NOT_FOUND, "User not found");
    }

    return successResponse(res, STATUS_CODES.OK, "Token is valid", { user });
  } catch (error) {
    return errorResponse(
      res,
      STATUS_CODES.INTERNAL_SERVER_ERROR,
      "Failed to fetch user",
    );
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return errorResponse(res, STATUS_CODES.BAD_REQUEST, "Email is required");
    }

    const user = await User.findOne({ email });
    if (!user) {
      return successResponse(
        res,
        STATUS_CODES.NOT_FOUND,
        "User does not exist",
      );
    }

    if (user && !user.isActive) {
      await OTP.deleteMany({ email });

      const otpCode = generateOTP();
      const saltKey = await bcrypt.genSalt(12);
      const hashedOtp = await bcrypt.hash(otpCode, saltKey);

      await OTP.create({
        email,
        otp: hashedOtp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      });

      const otpHTML = otpTemplate(otpCode, user.name);
      await sendMail(email, "Verify your Tenantrix Account", otpHTML);

      const token = generateToken({
        userId: user._id,
        organizationId: user.organizationId,
      });

      return successResponse(
        res,
        STATUS_CODES.TEMPORARY_REDIRECT,
        "User already exists but not verified. Please check your mail and verify your account",
        {},
        { token },
      );
    }

    // Remove old reset tokens
    await PasswordReset.deleteMany({ userId: user._id });

    // Generate raw token using crypto random bytes
    const rawToken = crypto.randomBytes(32).toString("hex");

    // Hash and save in DB
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    await PasswordReset.create({
      userId: user._id,
      token: hashedToken,
      expiresAt: Date.now() + 15 * 60 * 1000,
    });

    const resetUrl = `http://localhost:3000/reset-password/${rawToken}`;
    const resetEmailTemplate = resetPasswordTemplate(user.name, resetUrl, 15);
    await sendMail(
      user.email,
      "Reset Your Password – Tenantrix",
      resetEmailTemplate,
    );

    return successResponse(
      res,
      STATUS_CODES.OK,
      "Reset password link sent to registered email",
      {},
      { rawToken },
    );
  } catch (error) {
    console.error(error);
    return errorResponse(
      res,
      STATUS_CODES.INTERNAL_SERVER_ERROR,
      "Something went wrong",
    );
  }
};

export const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;
    if (!token) {
      return errorResponse(res, STATUS_CODES.BAD_REQUEST, "Token is required");
    }
    // Hash incoming token and find in DB
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const validRecord = await PasswordReset.findOne({
      token: hashedToken,
      expiresAt: { $gt: Date.now() },
    });

    if (!validRecord) {
      return errorResponse(
        res,
        STATUS_CODES.BAD_REQUEST,
        "Invalid or expired token",
      );
    }

    return successResponse(res, STATUS_CODES.OK, "Token is valid");
  } catch (error) {
    logger.info(error);
    return errorResponse(
      res,
      STATUS_CODES.INTERNAL_SERVER_ERROR,
      "Token verification failed",
    );
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword || !confirmPassword) {
      return errorResponse(
        res,
        STATUS_CODES.BAD_REQUEST,
        "Token, new password and confirm password are required",
      );
    }

    if (newPassword !== confirmPassword) {
      return errorResponse(
        res,
        STATUS_CODES.BAD_REQUEST,
        "Passwords do not match",
      );
    }

    // hash incoming token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // find token in DB
    const resetRecord = await PasswordReset.findOne({
      token: hashedToken,
      expiresAt: { $gt: Date.now() },
    });

    if (!resetRecord) {
      return errorResponse(
        res,
        STATUS_CODES.BAD_REQUEST,
        "Invalid or expired token",
      );
    }

    const user = await User.findById(resetRecord.userId);

    if (!user) {
      return errorResponse(res, STATUS_CODES.BAD_REQUEST, "User not found");
    }

    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    // delete token after use
    await PasswordReset.deleteMany({ userId: user._id });

    const emailTemplate = passwordResetSuccessTemplate(user.name);

    await sendMail(
      user.email,
      "Your Password Has Been Updated – Tenantrix",
      emailTemplate,
    );

    return successResponse(res, STATUS_CODES.OK, "Password reset successful");
  } catch (error) {
    console.error(error);

    return errorResponse(
      res,
      STATUS_CODES.INTERNAL_SERVER_ERROR,
      "Reset failed",
    );
  }
};

const generateToken = ({ userId, organizationId }) => {
  return jwt.sign(
    {
      userId,
      organizationId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );
};
