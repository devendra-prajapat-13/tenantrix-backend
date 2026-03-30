/**
 * @swagger
 * /v1/auth/register:
 *   post:
 *     summary: Register a new user (Step 1 - Create account & send OTP)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - organizationName
 *             properties:
 *               name:
 *                 type: string
 *                 example: Devendra Prajapat
 *               email:
 *                 type: string
 *                 example: dev@yopmail.com
 *               password:
 *                 type: string
 *                 example: 123456
 *               organizationName:
 *                 type: string
 *                 example: Tenantrix
 *     responses:
 *       201:
 *         description: Registration successful, OTP sent
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Registration successful. Please verify OTP sent to your email.
 *               data:
 *                 user:
 *                   _id: "66489a45db98f0b8a1a8a1a1"
 *                   name: Devendra Prajapat
 *                   email: dev@yopmail.com
 *                   organizationId: "66489a45db98f0b8a1a8a1a2"
 *                   role: owner
 *                   isActive: false
 *                 token: "jwt_token_here"
 */

/**
 * @swagger
 * /v1/auth/login:
 *   post:
 *     summary: Login user (Step 1 - Password verification & send OTP)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: dev@yopmail.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: OTP sent for login verification
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: We have sent you an email for two factor authentication
 *               data:
 *                 isOtpPending: true
 */

/**
 * @swagger
 * /v1/auth/verifyOtp:
 *   post:
 *     summary: Verify OTP (Step 2 - Complete Register/Login)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 example: dev@yopmail.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *         content:
 *           application/json:
 *             examples:
 *               registerSuccess:
 *                 summary: Register verification
 *                 value:
 *                   success: true
 *                   message: Account verified successfully
 *               loginSuccess:
 *                 summary: Login verification
 *                 value:
 *                   success: true
 *                   message: Login successful
 *                   data:
 *                     user:
 *                       _id: "66489a45db98f0b8a1a8a1a1"
 *                       name: Devendra Prajapat
 *                       email: dev@yopmail.com
 *                   token: "jwt_token_here"
 */

/**
 * @swagger
 * /v1/auth/resendOtp:
 *   post:
 *     summary: Resend OTP (Supports Register & Login 2FA, max 3 for login)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: dev@yopmail.com
 *     responses:
 *       200:
 *         description: OTP resent successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: OTP resent successfully
 *       429:
 *         description: OTP resend limit reached (Login flow)
 */

/**
 * @swagger
 * /v1/auth/check-user-active:
 *   post:
 *     summary: Check if user is active and send OTP if not verified
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: dev@yopmail.com
 *     responses:
 *       200:
 *         description: User status checked
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: User account already verified
 *               data:
 *                 isActive: true
 */

/**
 * @swagger
 * /v1/auth/verify-token:
 *   get:
 *     summary: Verify JWT token
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token valid
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Token is valid
 *               data:
 *                 user:
 *                   _id: "66489a45db98f0b8a1a8a1a1"
 *                   name: Devendra Prajapat
 *                   email: dev@yopmail.com
 */

/**
 * @swagger
 * /v1/auth/forgot-password:
 *   post:
 *     summary: Send reset password link
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: dev@yopmail.com
 *     responses:
 *       200:
 *         description: Reset link sent
 */

/**
 * @swagger
 * /v1/auth/verify-reset-token/{token}:
 *   get:
 *     summary: Verify password reset token
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Token is valid
 */

/**
 * @swagger
 * /v1/auth/reset-password:
 *   post:
 *     summary: Reset user password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 */