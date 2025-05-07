// const { Op } = require('sequelize');
// const Material = require('../../models/transactionModels/stockAvailabilityModel');
// const materialMaster = require("../../models/updateModels/materialMasterSchema");
// const unitType = require("../../models/updateModels/unitTypeSchema");

// // Create Material
// exports.createMaterial = async (req, res) => {
//   try {
//     const userId = req.userId;
//     if (!userId) {
//       return res.status(400).json({ error: "User ID is required." });
//     }

//     const { material_id, material_name, unit_type, available_stock } = req.body;
//     if (!material_id || !material_name || !unit_type) {
//       return res.status(400).json({ error: "Material ID, Name, and Unit Type are required." });
//     }

//     const newMaterial = await Material.create({
//       material_id,
//       material_name,
//       unit_type,
//       available_stock,
//       userId
//     });

//     return res.status(201).json(newMaterial);
//   } catch (err) {
//     console.error("Error creating material:", err);
//     return res.status(500).json({ error: err.message });
//   }
// };

// // Get Material Details with filtering and pagination
// exports.getMaterialDetails = async (req, res) => {
//   try {
//     const userId = req.userId;
//     const skip = parseInt(req.query.skip) || 0;
//     const limit = parseInt(req.query.limit) || 10;

//     const conditions = [];
//     const parseArray = value => (value && value !== '[]') ? value.split(',').map(item => item.trim()) : [];

//     if (req.query.material_id) {
//       conditions.push({ material_id: { [Op.in]: parseArray(req.query.material_id) } });
//     }

//     if (req.query.materialName) {
//       conditions.push({ material_name: { [Op.like]: `%${req.query.materialName}%` } });
//     }

//     if (req.query.unit) {
//       conditions.push({ unit_type: req.query.unit });
//     }

//     // Combine userId with other conditions using Op.and
//     let whereClause = { userId: userId }; // base condition

//     if (conditions.length > 0) {
//       whereClause = {
//         [Op.and]: [
//           { userId: userId },
//           { [Op.or]: conditions }
//         ]
//       };
//     }

//     const materialDetails = await Material.findAll({
//       where: whereClause,
//       offset: skip,
//       limit: limit,
//     });

//     const materialDetailsCount = await Material.count({ where: whereClause });

//     return res.status(200).json({ materialDetails, materialDetailsCount });
//   } catch (err) {
//     console.error("Error fetching material details:", err);
//     return res.status(500).json({ error: "Failed to fetch material details. Please try again later." });
//   }
// };

// // Get Material Master Details (user-specific)
// exports.getMaterialMasterDetails = async (req, res) => {
//   const userId = req.userId;
//   if (!userId) {
//     return res.status(400).json({ error: "User ID not found" });
//   }

//   try {
//     const materialDetails = await materialMaster.findAll({ where: { userId } });
//     res.json(materialDetails);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // Get Unit Type Details (user-specific)
// exports.getUnitTypeDetails = async (req, res) => {
//   const userId = req.userId;
//   if (!userId) {
//     return res.status(400).json({ error: "User ID not found" });
//   }

//   try {
//     const unitTypeDetails = await unitType.findAll({ where: { userId } });
//     res.json(unitTypeDetails);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


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
    const userId = req.userId;
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

    let whereClause = { userId: userId };

    if (conditions.length > 0) {
      whereClause = {
        [Op.and]: [
          { userId: userId },
          { [Op.or]: conditions }
        ]
      };
    }

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

// ✅ Get Material by ID
exports.getMaterialById = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const material = await Material.findOne({ where: { id, userId } });

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

    const material = await Material.findOne({ where: { id, userId } });

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

    const deleted = await Material.destroy({ where: { id, userId } });

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

