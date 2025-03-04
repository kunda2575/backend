const User = require("../models/signUpSchema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

dotenv.config();
const secretKey = process.env.JWT_SECRET;

// User Registration
const userRegister = async (req, res) => {
    const { fullName, userName, mobileNumber, email, profile, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: "Email already taken" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            fullName,
            userName,
            mobileNumber,
            email,
            profile,
            password: hashedPassword
        });

        await newUser.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

// User Login
const userLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const token = jwt.sign({ userId: user._id }, secretKey, { expiresIn: "1h" });
        res.status(200).json({ success: "Login successful", token });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

// Forgot Password
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: "User not found" });

        const resetToken = crypto.randomBytes(32).toString("hex");
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes

        await user.save();

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "Password Reset Request",
            text: `Use this token: ${resetToken} (valid for 15 minutes)`
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "Password reset email sent" });

    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

// Reset Password
const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;
    try {
        const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
        if (!user) return res.status(400).json({ error: "Invalid or expired token" });

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;

        await user.save();
        res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = { userRegister, userLogin, forgotPassword, resetPassword };
