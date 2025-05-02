const { Op } = require('sequelize');
const Material = require('../../models/transactionModels/stockAvailabilityModel');
const materialMaster = require("../../models/updateModels/materialMasterSchema");
const unitType = require("../../models/updateModels/unitTypeSchema");

// Create Material
exports.createMaterial = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required." });
    }

    const { material_id, material_name, unit_type, available_stock } = req.body;
    if (!material_id || !material_name || !unit_type) {
      return res.status(400).json({ error: "Material ID, Name, and Unit Type are required." });
    }

    const newMaterial = await Material.create({
      material_id,
      material_name,
      unit_type,
      available_stock,
      userId
    });

    return res.status(201).json(newMaterial);
  } catch (err) {
    console.error("Error creating material:", err);
    return res.status(500).json({ error: err.message });
  }
};

// Get Material Details with filtering and pagination
exports.getMaterialDetails = async (req, res) => {
  try {
    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 10;

    const conditions = [];
    const parseArray = value => (value && value !== '[]') ? value.split(',').map(item => item.trim()) : [];

    if (req.query.material_id) {
      conditions.push({ material_id: { [Op.in]: parseArray(req.query.material_id) } });
    }

    if (req.query.materialName) {
      conditions.push({ material_name: { [Op.like]: `%${req.query.materialName}%` } });
    }

    if (req.query.unit) {
      conditions.push({ unit_type: req.query.unit });
    }

    const whereClause = conditions.length > 0 ? { [Op.and]: conditions } : {};

    const materialDetails = await Material.findAll({
      where: whereClause,
      offset: skip,
      limit: limit,
    });

    const materialDetailsCount = await Material.count({ where: whereClause });

    return res.status(200).json({ materialDetails, materialDetailsCount });
  } catch (err) {
    console.error("Error fetching material details:", err);
    return res.status(500).json({ error: "Failed to fetch material details. Please try again later." });
  }
};

// Get Material Master Details (user-specific)
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

// Get Unit Type Details (user-specific)
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
