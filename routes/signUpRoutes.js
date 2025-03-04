const express = require("express");
const signUpController = require("../controllers/signUpController");

const router = express.Router();

/**
 * @swagger
 * /user/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user in the system.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName: { type: string, example: "John Doe" }
 *               userName: { type: string, example: "johndoe" }
 *               mobileNumber: { type: number, example: 9876543210 }
 *               email: { type: string, example: "johndoe@example.com" }
 *               profile: { type: string, example: "profile-pic-url" }
 *               password: { type: string, example: "password123" }
 *     responses:
 *       201: { description: "User registered successfully" }
 *       400: { description: "Email already taken" }
 */
router.post("/register", signUpController.userRegister);

/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: User Login
 *     description: Logs in a user with email and password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string, example: "johndoe@example.com" }
 *               password: { type: string, example: "password123" }
 *     responses:
 *       200: { description: "Login successful" }
 *       401: { description: "Invalid credentials" }
 */
router.post("/login", signUpController.userLogin);

/**
 * @swagger
 * /user/forgot-password:
 *   post:
 *     summary: Forgot Password
 *     description: Sends a password reset link to the user's email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string, example: "johndoe@example.com" }
 *     responses:
 *       200: { description: "Password reset email sent" }
 *       404: { description: "Email not found" }
 */
router.post("/forgot-password", signUpController.forgotPassword);

/**
 * @swagger
 * /user/reset-password:
 *   post:
 *     summary: Reset Password
 *     description: Resets the user's password using a token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token: { type: string, example: "reset-token-here" }
 *               newPassword: { type: string, example: "newpassword123" }
 *     responses:
 *       200: { description: "Password reset successfully" }
 *       400: { description: "Invalid token or password format" }
 */
router.post("/reset-password", signUpController.resetPassword);

module.exports = router;
