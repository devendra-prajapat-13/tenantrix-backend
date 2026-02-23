import mongoose from "mongoose";
import { ORGANIZATION_PLANS } from "../services/enum/enum.js";

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique:true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    plan: {
      type: String,
      enum: ORGANIZATION_PLANS,
      default: ORGANIZATION_PLANS.FREE,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Organization = mongoose.model("Organization", organizationSchema);
