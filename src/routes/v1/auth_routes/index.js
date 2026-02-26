import express from "express";
import { validate } from "../../../middleware/validate.middleware.js";
import { loginSchema, registerSchema,resendOtpSchema,verifyOtpSchema} from "./schema.js";
import { register,login, verifyOTP,resendOTP} from "../../../controllers/v1/auth.controller.js";
import { auth } from "../../../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register",validate(registerSchema),register);
router.post("/login",validate(loginSchema),login)
router.post("/verifyOtp", auth , validate(verifyOtpSchema),verifyOTP)
router.post("/resendOtp", auth , validate(resendOtpSchema),resendOTP);

export default router;