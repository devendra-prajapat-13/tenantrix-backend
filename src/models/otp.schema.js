import mongoose from "mongoose";
import { type } from "../services/enum/enum.js";

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      enum: type,
      required: true,
    },
  },
  { timestamps: true },
);

export const OTP = mongoose.model("OTP", otpSchema);
