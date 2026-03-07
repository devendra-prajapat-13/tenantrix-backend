/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication APIs
 */


/**
 * @swagger
 * /v1/auth/register:
 *   post:
 *     summary: Register a new user
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
 *         description: Registration successful
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Registration successful. Please verify your account using the OTP sent to your email.
 *               user:
 *                 _id: "66489a45db98f0b8a1a8a1a1"
 *                 name: Devendra Prajapat
 *                 email: dev@yopmail.com
 *                 organizationId: "66489a45db98f0b8a1a8a1a2"
 *                 role: owner
 *               token: "jwt_token_here"
 */


/**
 * @swagger
 * /v1/auth/login:
 *   post:
 *     summary: Login user
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
 *         description: Login successful
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Login successful
 *               user:
 *                 _id: "66489a45db98f0b8a1a8a1a1"
 *                 name: Devendra Prajapat
 *                 email: dev@yopmail.com
 *                 organizationId: "66489a45db98f0b8a1a8a1a2"
 *                 role: owner
 *               token: "jwt_token_here"
 */


/**
 * @swagger
 * /v1/auth/verifyOtp:
 *   post:
 *     summary: Verify user OTP
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: dev@yopmail.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Account verified successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Account verified successfully
 */


/**
 * @swagger
 * /v1/auth/resendOtp:
 *   post:
 *     summary: Resend OTP
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
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
 *               user:
 *                 _id: "66489a45db98f0b8a1a8a1a1"
 *                 name: Devendra Prajapat
 *                 email: dev@yopmail.com
 *                 role: owner
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
 *             properties:
 *               email:
 *                 type: string
 *                 example: dev@yopmail.com
 *     responses:
 *       200:
 *         description: Reset password link sent
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: reset password link sent to register email
 *               rawToken: "generated_reset_token"
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
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Password reset successful
 */