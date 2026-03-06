import Joi from "joi";

export const registerSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .pattern(/^[A-Za-z\s]+$/)
    .required()
    .messages({
      "string.empty": "Name is required",
      "string.min": "Name must be at least 2 characters",
      "string.pattern.base": "Name must contain only alphabets",
    }),

  email: Joi.string().email().required().messages({
    "string.email": "Invalid email format",
    "string.empty": "Email is required",
  }),

  password: Joi.string().min(8).max(20).required().messages({
    "string.min": "Password must be at least 8 characters",
  }),

  organizationName: Joi.string().trim().min(2).max(100).required().messages({
    "string.empty": "Organization name is required",
  }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Invalid email format",
    "string.empty": "Email is required",
    "any.required": "Email is required",
  }),

  password: Joi.string().min(6).required().messages({
    "string.empty": "Password is required",
    "any.required": "Password is required",
    "string.min": "Password must be at least 6 characters long",
  }),
});

export const verifyOtpSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Invalid email format",
    "string.empty": "Email is required",
  }),

  otp: Joi.string()
    .length(6)
    .pattern(/^[0-9]+$/)
    .required()
    .messages({
      "string.length": "OTP must be exactly 6 digits",
      "string.pattern.base": "OTP must contain only numbers",
      "string.empty": "OTP is required",
    }),
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().trim().required().messages({
    "string.empty": "Token is required",
    "any.required": "Token is required",
  }),

  newPassword: Joi.string().min(6).max(50).required().messages({
    "string.empty": "New password is required",
    "string.min": "Password must be at least 6 characters",
    "string.max": "Password must not exceed 50 characters",
    "any.required": "New password is required",
  }),

  confirmPassword: Joi.any().valid(Joi.ref("newPassword")).required().messages({
    "any.only": "Passwords do not match",
    "any.required": "Confirm password is required",
  }),
});

export const emailSchema = Joi.object({
  email: Joi.string()
    .email()
    .trim()
    .lowercase()
    .required()
    .messages({
      "string.email": "Invalid email format",
      "string.empty": "Email is required",
      "any.required": "Email is required",
    }),
});