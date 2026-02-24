import express from "express";
import auhtRouter from "./v1/auth_routes/index.js";

export const router = express.Router();

router.use("/v1/auth",auhtRouter);

export default router;
