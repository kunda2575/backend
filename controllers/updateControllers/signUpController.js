const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
const { Op } = require("sequelize"); // ✅ Import Op for correct query
// const User = require("../../models/updateModels/signUpSchema");
const OTP = require("../../models/updateModels/otp");
const { sequelize } = require("../../config/db");
const { User, ProjectMaster } = require('../../models/updateModels/index'); // must import from index.js
const { ValidationError } = require('sequelize');
// const ProjectMaster = require('../../models/updateModels/projectMasterSchema');
dotenv.config();
const secretKey = process.env.JWT_SECRET;


const checkEmailExists = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (user) {
      return res.status(409).json({ exists: true, message: "Email already registered" });
    }

    return res.json({ exists: false });
  } catch (err) {
    console.error("Email check failed:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


const sendOtp = async (req, res) => {
  const { email } = req.body;

  try {

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryTime = new Date(Date.now() + 6 * 60 * 1000); // 6 minutes expiry

    console.log("✅ Generated OTP:", otp);

    // Save OTP to database (upsert to update or insert)
    await OTP.upsert({ email, otp, expiry: expiryTime });

    // Configure email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      secure: true,
      tls: {
        rejectUnauthorized: false, // Only for development
      },
    });

    // Send OTP via email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP for Verification",
      text: `Your OTP is: ${otp}. It is valid for 6 minutes.`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("🚨 Error sending OTP email:", err);
        return res.status(500).json({ error: "Failed to send OTP email" });
      } else {
        console.log("✅ OTP email sent:", info.response);
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
    // console.log("Stored Expiry:", otpRecord?.expiry);
    // console.log("Current Time:", new Date());

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
  const t = await sequelize.transaction();

  try {
    const { fullname, mobilenumber, email, password, profile, project } = req.body;
    console.log(req.body)
    console.log("Project received during registration:", project);

    if (!fullname || !mobilenumber || !email || !password || !project || !project.length) {
      return res.status(400).json({ error: "All fields including at least one project are required" });
    }

    const username = `${email.split("@")[0]}`; // make username unique
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      fullname,
      username,
      mobilenumber,
      email,
      profile: profile || "default.jpg",
      password: hashedPassword,
    }, { transaction: t });

    // Ensure project is an array
    const projectArray = Array.isArray(project) ? project : [project];
    const projectIds = projectArray
      .map(p => typeof p === 'object' ? Number(p?.id) : Number(p))
      .filter(id => id && !isNaN(id));

    if (!projectIds.length) {
      await t.rollback();
      return res.status(400).json({ error: "No valid project IDs selected" });
    }

    await newUser.setProjects(projectIds, { transaction: t });

    await t.commit();

    // Send confirmation email (optional)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      secure: true,
      tls: { rejectUnauthorized: false },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Welcome to BUILDRVIEW - Registration Successful 🎉",
      text: `Dear ${fullname},

Welcome to BUILDRVIEW! 🎉 We're excited to have you on board.

Here are your account details:

📌 Full Name: ${fullname}  
📌 Username: ${username}  
📌 Email: ${email}  
📌 Profile: ${profile || "default.jpg"}  
📌 Mobile Number: ${mobilenumber}  

🔒 Please keep your credentials safe.

Best Regards,  
BUILDRVIEW Team`
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      success: "User registered successfully, details sent to email",
      user: newUser
    });

  } catch (error) {
    await t.rollback();
    console.error("❌ Error in registration:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


const getUsersByProject = async (req, res) => {
  const { projectId } = req.params;

  try {
    const users = await User.findAll({
      include: [
        {
          model: ProjectMaster,
          as: 'projects', // ✅ must match alias exactly
          where: { id: projectId },
          attributes: ['id', 'projectName', 'projectOwner', 'projectContact'],
          through: { attributes: [] } // ✅ to exclude join table fields
        }
      ],
      attributes: { exclude: ['password'] } // optional: hide password
    });

    res.status(200).json(users);
  } catch (error) {
    console.error("❌ Error fetching users by project:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getUser = async (req, res) => {
  try {
    const users = await User.findAll({
      include: [
        {
          model: ProjectMaster,
          as: 'projects', // must match `as` in belongsTo
          attributes: ['projectName'] // only what you need
        }
      ]
    });

    // Optionally flatten the data:
    const formattedUsers = users.map(user => ({
      ...user.toJSON(),
      projectName: user.project?.projectName || null
    }));

    res.status(200).json({ users: formattedUsers });
  } catch (err) {
    console.error('❌ Error fetching user:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// 🔹 Get Logged-in User Profile
const getUserProfile = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findOne({
      where: { userId },
      include: [
        {
          model: ProjectMaster,
          as: 'projects',
          attributes: ['projectName']
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const formattedUser = {
      ...user.toJSON(),
      projectName: user.projects?.projectName || null
    };

    res.status(200).json({ user: formattedUser });

    console.log("✅ user details", formattedUser);

  } catch (error) {
    console.error("❌ Error fetching user profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


const importUsersExcelData = async (req, res) => {
  try {
    const users = req.body.users;
console.log("users import data",users)
    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ error: "No user records provided." });
    }

    const requiredFields = ["fullname", "username", "mobilenumber", "email", "profile","projectName"];
    const errors = [];
    const cleanedUsers = [];

    users.forEach((record, index) => {
      const rowErrors = [];

      // Validate required fields
      requiredFields.forEach((field) => {
        if (
          record[field] === undefined ||
          record[field] === null ||
          String(record[field]).trim() === ""
        ) {
          rowErrors.push({
            row: index + 1,
            field,
            error: `${field} is required`
          });
        }
      });

      if (rowErrors.length === 0) {
        cleanedUsers.push({
          fullname: String(record.fullname).trim(),
          username: String(record.username).trim(),
          mobilenumber: String(record.mobilenumber).trim(),
          profile: String(record.profile).trim(),
          password: String(record.password).trim(),
          email: String(record.email).trim(),
          projectName: record.projectName ? String(record.projectName).trim() : null
        });
      } else {
        errors.push(...rowErrors);
      }
    });

    if (errors.length > 0) {
      return res.status(400).json({
        message: "Validation errors in uploaded user data.",
        errors
      });
    }

    const created = await User.bulkCreate(cleanedUsers, {
      validate: true,
      individualHooks: true
    });

    res.status(201).json({
      message: "Users imported successfully.",
      count: created.length
    });

  } catch (err) {
    if (err instanceof ValidationError) {
      const messages = err.errors.map((e) => e.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    console.error("User import error:", err);
    res.status(500).json({ error: "Internal server error during user import." });
  }
};

// ✅ Get only project names for dropdown
const getProjectDetails = async (req, res) => {
  try {
    const projects = await ProjectMaster.findAll();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateUserDetails = async (req, res) => {
  const { fullname, mobilenumber, email, profile, password, project } = req.body;
  const userId = req.params.userId;
console.log("updating ",req.body)
  if (!userId) return res.status(400).json({ message: "Missing userId" });

  const user = await User.findByPk(userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  // Normalize project input
  const projectArray = Array.isArray(project) ? project : [project];
  const projectIds = projectArray
    .map(p => typeof p === 'object' ? Number(p?.id) : Number(p))
    .filter(id => id && !isNaN(id));

  if (!projectIds.length) {
    return res.status(400).json({ message: "Invalid or missing project" });
  }

  const updatedData = {
    fullname,
    mobilenumber,
    email,
    profile
  };

  if (password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    updatedData.password = hashedPassword;
  }

  await user.update(updatedData);

  // Update user projects (assumes many-to-many)
  await user.setProjects(projectIds);

  res.json({ success: true, message: "User updated" });
};



// DELETE /api/users/:id
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({ success: false, message: "Missing user ID" });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    await user.destroy();

    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete User Error:", error);
    res.status(500).json({ success: false, message: "Failed to delete user" });
  }
};


const userLogin = async (req, res) => {
  try {
    const { email, mobilenumber, username, password, projectId } = req.body;
    console.log("🔐 Login attempt:", req.body);

    if (!email && !mobilenumber && !username) {
      return res.status(400).json({ error: "Email, mobile number or username is required" });
    }

    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }

    if (!projectId) {
      return res.status(400).json({ error: "Project is required" });
    }

    const parsedProjectId = parseInt(projectId);
    if (isNaN(parsedProjectId)) {
      return res.status(400).json({ error: "Invalid project ID format" });
    }

    // Find exact user with correct project association
    const user = await User.findOne({
      where: {
        [Op.or]: [
          ...(email ? [{ email }] : []),
          ...(mobilenumber ? [{ mobilenumber }] : []),
          ...(username ? [{ username }] : []),
        ],
      },
      include: [
        {
          model: ProjectMaster,
          as: 'projects',
          through: { attributes: [] },
          where: { id: parsedProjectId },
          required: true,
        },
      ],
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials or not assigned to this project" });
    }

    const token = jwt.sign({ userId: user.userId }, secretKey);

    const userData = user.get({ plain: true });
    delete userData.password;

    // Extract only the selected project
    const selectedProject = user.projects.find(p => p.id === parsedProjectId);

    res.status(200).json({
      success: "Login successful",
      token,
      user: {
        ...userData,
        projects: [selectedProject], // ✅ Only one
      },
      projectId: selectedProject?.id || null,
    });


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
    // console.error("Error in forgot password:", error);
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

    if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {

      await User.update(
        { resetPasswordToken: null, resetPasswordExpires: null },
        { where: { resetPasswordToken: otp } }
      );
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);



    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });

  } catch (error) {
    // console.error("Error resetting password:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { checkEmailExists, deleteUser,importUsersExcelData, sendOtp, verifyOtp, userRegister, getUsersByProject, getUserProfile, getUser, getProjectDetails, updateUserDetails, userLogin, forgotPassword, resetPassword };
