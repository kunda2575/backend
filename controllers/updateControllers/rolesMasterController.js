const { ValidationError } = require('sequelize');
const Roles = require('../../models/updateModels/rolesMasterSchema');

// Create
exports.createRoles = async (req, res) => {
  try {
    // const projectId = req.projectId;
    const { rolesName } = req.body;
    const newRoles = await Roles.create({ rolesName});
    res.status(201).json(newRoles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.importRolesData = async (req, res) => {
  try {
    const roles = req.body.roles;
//  const projectId = req.projectId;
    if (!Array.isArray(roles) || roles.length === 0) {
      return res.status(400).json({ error: "No roles records provided." });
    }

    const errors = [];
    const cleanedRoles = [];

    roles.forEach((record, index) => {
      if (!record.rolesName || String(record.rolesName).trim() === "") {
        errors.push({
          row: index + 1,
          field: "rolesName",
          error: "rolesName is required"
        });
      } else {
        cleanedRoles.push({
          rolesName: String(record.rolesName).trim(),
          // projectId
        });
      }
    });

    if (errors.length > 0) {
      return res.status(400).json({
        message: "Validation errors in uploaded roles data.",
        errors
      });
    }

    const created = await Roles.bulkCreate(cleanedRoles, {
      validate: true,
      individualHooks: true
    });

    res.status(201).json({
      message: "Roles imported successfully.",
      count: created.length
    });

  } catch (err) {
    if (err instanceof ValidationError) {
      const messages = err.errors.map(e => e.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    console.error("Roles import error:", err);
    res.status(500).json({ error: "Internal server error during roles import." });
  }
};

// Read all
exports.getRoless = async (req, res) => {
  try {
    // const projectId = req.projectId;
    const rolesName = await Roles.findAll();
    res.json(rolesName);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update
exports.updateRoles = async (req, res) => {
  try {
    const projectId = req.projectId;
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
    const projectId = req.projectId;
    const { id } = req.params;
    const deleted = await Roles.destroy({ where: { id } });
    if (!deleted) return res.status(404).json({ error: "Roles not found" });
    res.json({ message: "RoleS deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
