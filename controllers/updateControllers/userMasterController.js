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
