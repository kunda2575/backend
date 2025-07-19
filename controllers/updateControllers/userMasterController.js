const { ValidationError } = require('sequelize');
const UserMaster = require('../../models/updateModels/userMasterSchema');
const ProjectMaster = require('../../models/updateModels/projectMasterSchema');

// Create
exports.createUser = async (req, res) => {
  try {
    const userId = req.userId;
    const { userName, password, role, phone, email,projectName } = req.body;
    const newUser = await UserMaster.create({ userName, password, role, phone, email,projectName});
    res.status(201).json(newUser);
  } catch (err) {
     if (err instanceof ValidationError) {
      const messages = err.errors.map((e) => e.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
   
  }
};

exports.importUsersExcelData = async (req, res) => {
  try {
    const users = req.body.users;

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ error: "No user records provided." });
    }

    const requiredFields = ["userName", "password", "role", "phone", "email"];
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
          userName: String(record.userName).trim(),
          password: String(record.password).trim(),
          role: String(record.role).trim(),
          phone: String(record.phone).trim(),
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

    const created = await UserMaster.bulkCreate(cleanedUsers, {
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


// Read all
exports.getUsers = async (req, res) => {
  try {
    const userId = req.userId;
    const User = await UserMaster.findAll();
    res.json(User);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update
exports.updateUser = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { userName, password, role, phone, email,projectName } = req.body;
    const Users = await UserMaster.findOne({ where: {id } });
    if (!Users) return res.status(404).json({ error: "User not found" });

   
    Users.userName=userName,
    Users.password=password,
    Users.role=role,
    Users.phone=phone,
    Users.email=email
    Users.projectName=projectName

    await Users.save();

    res.json(Users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const deleted = await UserMaster.destroy({ where: { id } });
    if (!deleted) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// ✅ Get only project names for dropdown
exports.getProjectDetails = async (req, res) => {
  try {
    const projects = await ProjectMaster.findAll();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
