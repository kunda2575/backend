

const { Op } = require('sequelize');
const Material = require('../../models/transactionModels/stockAvailabilityModel');
const materialMaster = require("../../models/updateModels/materialMasterSchema");
const unitType = require("../../models/updateModels/unitTypeSchema");

const { ValidationError } = require('sequelize');

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
      
    });

    return res.status(201).json(newMaterial);
  } catch (err) {
     if (err instanceof ValidationError) {
      const messages = err.errors.map((e) => e.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    return res.status(500).json({ error: err.message });
  }
};

// Get Material Details with filtering and pagination

exports.getMaterialDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 10;

    const filters = [];
    const parseArray = (value) => value ? value.split(',') : [];

    if (req.query.material_id) {
      filters.push({ material_id: { [Op.in]: parseArray(req.query.material_id) } });
    }

    if (req.query.materialName) {
      filters.push({ material_name: { [Op.like]: `%${req.query.materialName}%` } });
    }

    if (req.query.unit) {
      filters.push({ unit_type: { [Op.in]: parseArray(req.query.unit) } });
    }

    let whereClause = {};
    if (filters.length > 0) {
      whereClause = {
        [Op.and]: [{ [Op.or]: filters }]
      };
    }

    const materialDetails = await Material.findAll({
      where: whereClause,
      offset: skip,
      limit,
    });

    const materialDetailsCount = await Material.count({ where: whereClause });

    return res.status(200).json({ materialDetails, materialDetailsCount });
  } catch (err) {
    console.error("Error fetching material details:", err);
    return res.status(500).json({ error: "Failed to fetch material details." });
  }
};
// ✅ Get Material by ID
exports.getMaterialById = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const material = await Material.findOne({ where: { id } });

    if (!material) {
      return res.status(404).json({ error: "Material not found or unauthorized access." });
    }

    return res.status(200).json(material);
  } catch (err) {
    console.error("Error fetching material by ID:", err);
    return res.status(500).json({ error: err.message });
  }
};

// ✅ Update Material
exports.updateMaterial = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params; // Primary key (assumed)
    const { material_id, material_name, unit_type, available_stock } = req.body;

    const material = await Material.findOne({ where: { id } });

    if (!material) {
      return res.status(404).json({ error: "Material not found or unauthorized access." });
    }

    await material.update({
      material_id,
      material_name,
      unit_type,
      available_stock
    });

    return res.status(200).json({ message: "Material updated successfully.", material });
  } catch (err) {
    console.error("Error updating material:", err);
    return res.status(500).json({ error: err.message });
  }
};

// ✅ Delete Material
exports.deleteMaterial = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params; // Primary key (assumed)

    const deleted = await Material.destroy({ where: { id } });

    if (!deleted) {
      return res.status(404).json({ error: "Material not found or unauthorized access." });
    }

    // await material.destroy();

    return res.status(200).json({ message: "Material deleted successfully." });
  } catch (err) {
    console.error("Error deleting material:", err);
    return res.status(500).json({ error: err.message });
  }
};


// Get Material Master Details (user-specific)
exports.getMaterialMasterDetails = async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(400).json({ error: "User ID not found" });
  }

  try {
    const materialDetails = await materialMaster.findAll();
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
    const unitTypeDetails = await unitType.findAll();
    res.json(unitTypeDetails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.importStockAvailabilityFromExcel = async (req, res) => {
  try {
    const stockAvailabilityArray = req.body.stockAvailability;

    if (!Array.isArray(stockAvailabilityArray) || stockAvailabilityArray.length === 0) {
      return res.status(400).json({ error: "No stock availability records provided." });
    }

    const requiredFields = ["material_id", "material_name", "unit_type", "available_stock"];
    const errors = [];
    const cleanedStock = [];

    stockAvailabilityArray.forEach((record, index) => {
      const rowErrors = [];

      // Validate required fields
      requiredFields.forEach((field) => {
        const value = record[field];
        if (value === undefined || value === null || String(value).trim() === '') {
          rowErrors.push({
            field,
            error: `${field} is required`,
            row: index + 1
          });
        }
      });

      if (rowErrors.length > 0) {
        errors.push(...rowErrors);
      } else {
        cleanedStock.push({
          material_id: String(record.material_id).trim(),
          material_name: String(record.material_name).trim(),
          unit_type: String(record.unit_type).trim(),
          available_stock: Number(record.available_stock),
        });
      }
    });

    if (errors.length > 0) {
      return res.status(400).json({
        message: "Validation errors in uploaded Excel data.",
        errors
      });
    }

    // Bulk insert into database
    const created = await Material.bulkCreate(cleanedStock, {
      validate: true,
      individualHooks: true
    });

    return res.status(201).json({
      message: "Stock availability records imported successfully.",
      count: created.length
    });
  } catch (err) {
    console.error("Import Error:", err);
    return res.status(500).json({
      error: "Internal server error during import."
    });
  }
};