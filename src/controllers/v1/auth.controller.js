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
} from "../../services/mailer/templates/email.template.js";

export const register = async (req, res) => {
  try {
    const { name, email, password, organizationName } = req.body;

    // validation
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

    // check existing user
    const existingUser = await User.findOne({ email });
    // CASE 1 — user exists but NOT verified → resend OTP + token
    if (existingUser && !existingUser.isActive) {
      await OTP.deleteMany({ email });

      const otpCode = generateOTP();
      const saltKey = await bcrypt.genSalt(12);
      const hashedOtp = await bcrypt.hash(otpCode, saltKey);

      await OTP.create({
        email,
        otp: hashedOtp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      });

      const otpHTML = otpTemplate(otpCode, existingUser.name);
      await sendMail(email, "Verify your Tenantrix Account", otpHTML);

      // generate token
      const token = generateToken({
        userId: existingUser._id,
        organizationId: existingUser.organizationId,
      });

      return successResponse(
        res,
        STATUS_CODES.OK,
        "User already Exist But not verified.just check mail and verified your account",
        {
          user: {
            _id: existingUser._id,
            name: existingUser.name,
            email: existingUser.email,
            organizationId: existingUser.organizationId,
            role: existingUser.role,
          },
        },
        { token },
      );
    }
   console.log("sdjsldgjlkddsgs");
    // CASE 2 — user exists & already verified
    if (existingUser && existingUser.isActive) {
      return errorResponse(
        res,
        STATUS_CODES.CONFLICT,
        "User already exists. Please login.",
      );
    }
 console.log("sdjsldgjlkddsgs");
    // create slug for organization
    const slug = organizationName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");

    // check duplicate organization slug
    const existingOrg = await Organization.findOne({ slug });
    if (existingOrg) {
      return errorResponse(
        res,
        STATUS_CODES.CONFLICT,
        "Organization name is already in use",
      );
    }

    // CASE 3 — new user
    const organization = await Organization.create({
      name: organizationName,
      slug,
      ownerId: null,
    });

    const saltKey = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, saltKey);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: USER_ROLES.OWNER,
      organizationName,
      organizationId: organization._id,
      isActive: false,
    });

    organization.ownerId = user._id;
    await organization.save();

    const token = generateToken({
      userId: user._id,
      organizationId: organization._id,
    });

    // Generate OTP
    const otpCode = generateOTP();
    const hashedOtp = await bcrypt.hash(otpCode, saltKey);

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
      "Registration successful. Please verify your account using the OTP sent to your email.",
      {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          organizationId: user.organizationId,
          role: user.role,
        },
      },
      { token },
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

    // basic validation
    if (!email || !password) {
      return errorResponse(
        res,
        STATUS_CODES.BAD_REQUEST,
        "Email and password are required",
      );
    }

    // find user
    const user = await User.findOne({ email });

    if (!user) {
      return errorResponse(
        res,
        STATUS_CODES.UNAUTHORIZED,
        "Invalid credentials",
      );
    }

    // check account verified
    if (!user.isActive) {
      return errorResponse(
        res,
        STATUS_CODES.FORBIDDEN,
        "Please verify your account first",
      );
    }

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return errorResponse(
        res,
        STATUS_CODES.UNAUTHORIZED,
        "Invalid credentials",
      );
    }

    // generate token
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
      return errorResponse(res, STATUS_CODES.BAD_REQUEST, "Invalid OTP");
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
      dashboardUrl: "https://app.tenantrix.com/dashboard",
      userEmail: user.email,
      planName: "Free",
      workspaceUrl: `https://${user.organizationName}.tenantrix.com`,
      companyAddress: "Indore, India",
      companyWebsite: "https://tenantrix.com",
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
