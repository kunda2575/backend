const { Op } = require('sequelize');
const MaterialIssue = require("../../models/transactionModels/materialIssueModel");
const materialMaster = require("../../models/updateModels/materialMasterSchema");
const unitType = require("../../models/updateModels/unitTypeSchema");

// ✅ Create MaterialIssue
exports.createMaterialIssue = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required." });
    }

    const {
      material_name,
      unit_type,
      quantity_issued,
      issued_by,
      issued_to,
      issue_date
    } = req.body;

    const newMaterialIssue = await MaterialIssue.create({
      material_name,
      unit_type,
      quantity_issued,
      issued_by,
      issued_to,
      issue_date,
      userId
    });

    return res.status(201).json(newMaterialIssue);
  } catch (err) {
    console.error("❌ Error creating material:", err);
    return res.status(500).json({ error: err.message });
  }
};

// ✅ Get MaterialIssue Details with filtering and pagination
exports. getMaterialIssueDetails = async (req, res) => {
    const { skip = 0, limit = 10, material_name, unit_type } = req.query;
    const userId = req.userId;

    const whereClause = { userId };
    if (material_name) whereClause.material_name = material_name;
    if (unit_type) whereClause.unit_type = unit_type;

    try {
        const [materialDetails, materialDetailsCount] = await Promise.all([
            MaterialIssue.findAll({
                where: whereClause,
                offset: parseInt(skip),
                limit: parseInt(limit),
                order: [['issue_date', 'DESC']],
            }),
            MaterialIssue.count({ where: whereClause }),
        ]);

        res.status(200).json({ materialDetails, materialDetailsCount });
    } catch (error) {
        console.error("❌ Failed to fetch material issues:", error);
        res.status(500).json({ error: 'Server error' });
    }
};

// ✅ Get MaterialIssue by ID
exports.getMaterialIssueById = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const material = await MaterialIssue.findOne({ where: { id, userId } });

    if (!material) {
      return res.status(404).json({ error: "MaterialIssue not found or unauthorized access." });
    }

    return res.status(200).json(material);
  } catch (err) {
    console.error("❌ Error fetching material by ID:", err);
    return res.status(500).json({ error: err.message });
  }
};

// ✅ Update MaterialIssue
exports.updateMaterialIssue = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const {
      material_name,
      unit_type,
      quantity_issued,
      issued_by,
      issued_to,
      issue_date
    } = req.body;

    const material = await MaterialIssue.findOne({ where: { id, userId } });

    if (!material) {
      return res.status(404).json({ error: "MaterialIssue not found or unauthorized access." });
    }

    await material.update({
      material_name,
      unit_type,
      quantity_issued,
      issued_by,
      issued_to,
      issue_date
    });

    return res.status(200).json({ message: "MaterialIssue updated successfully.", material });
  } catch (err) {
    console.error("❌ Error updating material:", err);
    return res.status(500).json({ error: err.message });
  }
};

// ✅ Delete MaterialIssue
exports.deleteMaterialIssue = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const deleted = await MaterialIssue.destroy({ where: { id, userId } });

    if (!deleted) {
      return res.status(404).json({ error: "MaterialIssue not found or unauthorized access." });
    }

    return res.status(200).json({ message: "MaterialIssue deleted successfully." });
  } catch (err) {
    console.error("❌ Error deleting material:", err);
    return res.status(500).json({ error: err.message });
  }
};

// ✅ Get Material Master Details (user-specific)
exports.getMaterialMasterDetails = async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(400).json({ error: "User ID not found" });
  }

  try {
    const materialDetails = await materialMaster.findAll({ where: { userId } });
    res.json(materialDetails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get Unit Type Details (user-specific)
exports.getUnitTypeDetails = async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(400).json({ error: "User ID not found" });
  }

  try {
    const unitTypeDetails = await unitType.findAll({ where: { userId } });
    res.json(unitTypeDetails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
