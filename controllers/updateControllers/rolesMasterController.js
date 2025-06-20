const Roles = require('../../models/updateModels/rolesMasterSchema');

// Create
exports.createRoles = async (req, res) => {
  try {
    const userId = req.userId;
    const { rolesName } = req.body;
    const newRoles = await Roles.create({ rolesName});
    res.status(201).json(newRoles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Read all
exports.getRoless = async (req, res) => {
  try {
    const userId = req.userId;
    const rolesName = await Roles.findAll();
    res.json(rolesName);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update
exports.updateRoles = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { rolesName } = req.body;
    const rolesNames = await Roles.findOne({ where: {id } });
    if (!rolesNames) return res.status(404).json({ error: "Roles not found" });

   
    rolesNames.rolesName=rolesName
    await rolesNames.save();

    res.json(rolesName);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete
exports.deleteRoles = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const deleted = await Roles.destroy({ where: { id } });
    if (!deleted) return res.status(404).json({ error: "Roles not found" });
    res.json({ message: "RoleS deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
