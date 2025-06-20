const { Op } = require('sequelize');
const MaterialIssue = require("../../models/transactionModels/materialIssueModel");
const materialMaster = require("../../models/updateModels/materialMasterSchema");
const unitType = require("../../models/updateModels/unitTypeSchema");

// ✅ Create MaterialIssue
exports.createMaterialIssue = async (req, res) => {
  try {
    const userId = req.userId;
    // if (!userId) {
    //   return res.status(400).json({ error: "User ID is required." });
    // }

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
    
    });

    return res.status(201).json(newMaterialIssue);
  } catch (err) {
    console.error("❌ Error creating material:", err);
    return res.status(500).json({ error: err.message });
  }
};

exports.getMaterialIssuesDetails = async (req, res) => {
    try {
        // const userId = req.userId;
        // console.log("Decoded JWT payload:", req.userId);  // Ensure userId is present

        // if (!userId) {
        //     return res.status(400).json({ error: "User ID is required." });
        // }

        const skip = parseInt(req.query.skip) || 0;
        const limit = parseInt(req.query.limit) || 10;
        console.log("Pagination params - skip:", skip, "limit:", limit);

        const filters = [];
        const parseArray = (value) => value ? value.split(',') : [];

        // Log the filters applied
        if (req.query.material_name && req.query.material_name !== "") {
            filters.push({ material_name: { [Op.in]: parseArray(req.query.material_name) } });
            console.log("material  name filter applied:", req.query.material_name);
        }
        if (req.query.unit_type && req.query.unit_type !== "") {
            filters.push({ unit_type: { [Op.in]: parseArray(req.query.unit_type) } });
            console.log("unit type  filter applied:", req.query.unit_type);
        }
       
        console.log("Filters applied:", filters);

      
    let whereClause = {};
    if (filters.length > 0) {
      whereClause = {
        [Op.and]: [{ [Op.or]: filters }]
      };
    }

        console.log("Final where clause:", whereClause);

        const materialIssuesDetails = await MaterialIssue.findAll({
            where: whereClause,
            offset: skip,
            limit: limit,
            logging: console.log
        });

        if (!materialIssuesDetails.length) {
            return res.status(404).json({ error: "No materialIssuess found." });
        }

        const materialIssuesDetailsCount = await MaterialIssue.count({
            where: whereClause
        });

        return res.status(200).json({
            materialIssuesDetails,
            materialIssuesDetailsCount
        });
    } catch (err) {
        console.error("Error fetching materialIssues details:", err.message, err.stack);
        return res.status(500).json({ error: "Failed to fetch materialIssues details." });
    }
};

// ✅ Get MaterialIssue by ID
exports.getMaterialIssueById = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const material = await MaterialIssue.findOne({ where: { id } });

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

    const material = await MaterialIssue.findOne({ where: { id } });

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

    const deleted = await MaterialIssue.destroy({ where: { id } });

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
 

  try {
    const materialDetails = await materialMaster.findAll();
    res.json(materialDetails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get Unit Type Details (user-specific)
exports.getUnitTypeDetails = async (req, res) => {
  const userId = req.userId;
  // if (!userId) {
  //   return res.status(400).json({ error: "User ID not found" });
  // }

  try {
    const unitTypeDetails = await unitType.findAll();
    res.json(unitTypeDetails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
