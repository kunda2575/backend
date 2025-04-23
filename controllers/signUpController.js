const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
const { Op } = require("sequelize"); // ✅ Import Op for correct query
const User = require("../models/signUpSchema");
const OTP = require("../models/otp");
const { sequelize } = require("../config/db");

dotenv.config();
const secretKey = process.env.JWT_SECRET;

const sendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if the email is already registered
    const userExists = await User.findOne({ where: { email } });

    if (userExists) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryTime = new Date(Date.now() + 6 * 60 * 1000); // 6 minutes expiry

    console.log("✅ Generated OTP:", otp);

    // Save OTP to database
    await OTP.upsert({ email, otp, expiry: expiryTime });

    // Configure email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      secure: true, // Use TLS
      tls: {
        rejectUnauthorized: false, // For development only, not recommended in production
      },
    });
    

    // Verify SMTP Connection
    transporter.verify((error, success) => {
      if (error) {
        console.error("🚨 SMTP Connection Error:", error);
        return res.status(500).json({ error: "Email server error" });
      } else {
        console.log("✅ SMTP Server is Ready to Send Emails");
      }
    });

    // Send OTP via email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Email Verification OTP",
      text: `Your OTP is: ${otp}. It is valid for 5 minutes.`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("🚨 Error sending OTP email:", err);
        return res.status(500).json({ error: "Failed to send OTP email" });
      } else {
        console.log("✅ Email sent:", info.response);
        return res.status(200).json({ message: "OTP sent to email" });
      }
    });

  } catch (error) {
    console.error("🚨 Error in sendOtp:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// 🔹 Verify OTP for Registration
const verifyOtp = async (req, res) => {

  const { email, otp } = req.body;

  try {
    // Ensure OTP is treated as a string
    const otpRecord = await OTP.findOne({
      where: {
        email,
        otp: String(otp), // ✅ Convert to string
        expiry: { [Op.gt]: new Date() }, // ✅ Fix expiry check
      },
    });

    // Debugging logs
    console.log("Stored Expiry:", otpRecord?.expiry);
    console.log("Current Time:", new Date());

    if (!otpRecord) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    // Delete OTP after successful verification
    await OTP.destroy({ where: { email } });

    res.status(200).json({ success: true });

  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const userRegister = async (req, res) => {
  const t = await sequelize.transaction(); // Start transaction

  try {
    console.log("✅ Received Registration Data:", req.body);

    const { fullname, mobilenumber, email, password, profile } = req.body;

    if (!fullname || !mobilenumber || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Extract username from email (before '@')
    const username = email.split("@")[0];

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user within the transaction
    const newUser = await User.create(
      {
        fullname,
        username, // Store extracted username
        mobilenumber,
        email,
        profile: profile || "default.jpg",
        password: hashedPassword,
      },
      { transaction: t } // Ensure transaction consistency
    );

    await t.commit(); // Commit transaction

    console.log("✅ User stored successfully:", newUser.toJSON());

    // Send email with user details
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      secure: true, // Use TLS
      tls: {
        rejectUnauthorized: false, // For development only, not recommended in production
      },
    });
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Welcome to [Your Platform Name] - Registration Successful 🎉",
      text: `Dear ${fullname},
  
  Welcome to [Your Platform Name]! 🎉 We're excited to have you on board.
  
  Here are your account details:
  
  📌 **Full Name:** ${fullname}  
  📌 **Username:** ${username}  
  📌 **Email:** ${email}  
  📌 **Profile Picture:** ${profile || "default.jpg"}  
  📌 **Mobile Number:** ${mobilenumber}  
  
  🔒 **Please keep your credentials safe.** If you ever forget your password, you can reset it using the "Forgot Password" option on our website.
  
  If you have any questions or need assistance, feel free to reach out to our support team.
  
  Best Regards,  
  **[Your Team Name]**  
  [Your Website URL]  
  [Your Support Email]`
    };


    await transporter.sendMail(mailOptions);

    res.status(201).json({ success: "User registered successfully, details sent to email", user: newUser });

  } catch (error) {
    await t.rollback(); // Rollback on error
    console.error("❌ Error in registration:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 🔹 Login User
const userLogin = async (req, res) => {
  try {
    const { email, mobilenumber, username, password } = req.body;

    if (!email && !mobilenumber && !username) {
      return res.status(400).json({ error: "Email or username or mobile number is required" });
    }
    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }

    const user = await User.findOne({ where: { [Op.or]: [{ email }, { mobilenumber }, { username }] } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid email/mobile or password" });
    }

    const token = jwt.sign({ userId: user.userId }, secretKey);
    res.status(200).json({ success: "Login successful", token, user });

  } catch (error) {
    console.error("❌ Error in login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 🔹 Forgot Password (Send OTP)
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryTime = new Date(Date.now() + 15 * 60 * 1000);

    await User.update(
      { resetPasswordToken: otp, resetPasswordExpires: expiryTime },
      { where: { email } }
    );

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      secure: true, // Use TLS
      tls: {
        rejectUnauthorized: false, // For development only, not recommended in production
      },
    });
    

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is: ${otp}. It is valid for 6 minutes.`,
    });

    res.status(200).json({ message: "OTP sent to your email" });

  } catch (error) {
    console.error("Error in forgot password:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 🔹 Reset Password
const resetPassword = async (req, res) => {
  const { otp, newPassword } = req.body;

  try {
    const user = await User.findOne({
      where: { resetPasswordToken: otp, resetPasswordExpires: { [Op.gt]: new Date() } },
    });

    if (!user || !user.resetPasswordExpires||user.resetPasswordExpires<new Date()) {
      
    await User.update(
      { resetPasswordToken: null, resetPasswordExpires: null },
      { where: { resetPasswordToken: otp } }
    );
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);



    user.password=hashedPassword;
    user.resetPasswordToken=null;
    user.resetPasswordExpires=null;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });

  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { sendOtp, verifyOtp, userRegister, userLogin, forgotPassword, resetPassword };
