import express from "express";
import { validate } from "../../../middleware/validate.middleware.js";
import { loginSchema, registerSchema,emailSchema,verifyOtpSchema, resetPasswordSchema} from "./schema.js";
import { register,login, verifyOTP,resendOTP, verifyToken, forgotPassword, resetPassword,verifyResetToken,checkUserActive} from "../../../controllers/v1/auth.controller.js";
import { auth } from "../../../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register",validate(registerSchema),register);
router.post("/login",validate(loginSchema),login)
router.post("/check-user-active",validate(emailSchema),checkUserActive);
router.get("/verify-token",auth,verifyToken);
router.post("/verifyOtp", validate(verifyOtpSchema),verifyOTP)
router.post("/resendOtp", validate(emailSchema),resendOTP);
router.post("/forgot-password",validate(emailSchema),forgotPassword);
router.get("/verify-reset-token/:token", verifyResetToken);
router.post("/reset-password",validate(resetPasswordSchema),resetPassword);

export default router;