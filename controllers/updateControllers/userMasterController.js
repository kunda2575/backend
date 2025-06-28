const { ValidationError } = require('sequelize');
const UserMaster = require('../../models/updateModels/userMasterSchema');

// Create
exports.createUser = async (req, res) => {
  try {
    const userId = req.userId;
    const { userName, password, role, phone, email } = req.body;
    const newUser = await UserMaster.create({ userName, password, role, phone, email});
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
    const { userName, password, role, phone, email } = req.body;
    const Users = await UserMaster.findOne({ where: {id } });
    if (!Users) return res.status(404).json({ error: "User not found" });

   
    Users.userName=userName,
    Users.password=password,
    Users.role=role,
    Users.phone=phone,
    Users.email=email

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
