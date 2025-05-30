const { Op } = require('sequelize');
const inventoryEntry = require('../../models/transactionModels/inventoryEntryModel');
const unitType = require("../../models/updateModels/unitTypeSchema");
const vendor = require('../../models/updateModels/vendorMasterSchema');
const materialMaster = require('../../models/updateModels/materialMasterSchema');

const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require('uuid');

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/invoices");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

exports.upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

// ✅ Create Inventory Entry
exports.createInventoryEntry = async (req, res) => {
  try {
    const {
      material_id,
      material_name,
      vendor_name,
      invoice_number,
      invoice_date,
      invoice_cost_incl_gst,
      unit_type,
      quantity_received,
      entered_by,
    } = req.body;

    const userId = req.userId;

    const files = req.files || [];
    const invoiceAttachments = files.map(file => file.filename); // Store only filenames
console.log("Uploaded files:", req.files);

    const newEntry = await inventoryEntry.create({
      material_id,
      material_name,
      vendor_name,
      invoice_number,
      invoice_date,
      invoice_cost_incl_gst,
      unit_type,
      quantity_received,
      invoice_attachment: invoiceAttachments.join(','), // Save as comma-separated string
      entered_by,
      userId,
    });

    res.status(201).json({ success: true, data: newEntry });
  } catch (error) {
    console.error("Error creating inventory entry:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Get Inventory Details (Filtered)
exports.getInventaryDetails = async (req, res) => {
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

    if (req.query.vendorName) {
      conditions.push({ vendor_name: req.query.vendorName });
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

    const inventoryDetails = await inventoryEntry.findAll({
      where: whereClause,
      offset: skip,
      limit: limit,
    });

    const updatedProperties = inventoryDetails.map(property => ({
      ...property.toJSON(),
      invoice_attachment: property.invoice_attachment
        ? property.invoice_attachment.split(",").map(img => `http://localhost:2026/uploads/${img}`): []
    }));

    const inventoryDetailsCount = await inventoryEntry.count({ where: whereClause });

    return res.status(200).json({ updatedProperties, inventoryDetails, inventoryDetailsCount });
  } catch (err) {
    console.error("Error fetching inventory details:", err);
    return res.status(500).json({ error: "Failed to fetch inventory details. Please try again later." });
  }
};

// ✅ Get Inventory by ID
exports.getInventoryById = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const inventory = await inventoryEntry.findOne({ where: { id, userId } });

    if (!inventory) {
      return res.status(404).json({ error: "Material not found or unauthorized access." });
    }

    const updatedProperty = {
      ...inventory.toJSON(),
      invoice_attachment: inventory.invoice_attachment
        ? inventory.invoice_attachment.split(",").map(img => `http://localhost:2026/uploads/${img}`)
        : []
    };

    res.status(200).json({ success: true, data: updatedProperty });
  } catch (err) {
    console.error("Error fetching inventory by ID:", err);
    return res.status(500).json({ error: err.message });
  }
};

// ✅ Update Inventory
exports.updateInventory = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const {
      material_id,
      material_name,
      invoice_date,
      vendor_name,
      invoice_number,
      invoice_cost_incl_gst,
      unit_type,
      quantity_received,
      invoice_attachment,
      entered_by
    } = req.body;

    const inventory = await inventoryEntry.findOne({ where: { id, userId } });

    if (!inventory) {
      return res.status(404).json({ error: "Inventory not found or unauthorized access." });
    }

    await inventory.update({
      material_id,
      material_name,
      invoice_date,
      vendor_name,
      invoice_number,
      invoice_cost_incl_gst,
      unit_type,
      quantity_received,
      invoice_attachment, // this should be a comma-separated string of filenames
      entered_by
    });

    return res.status(200).json({ message: "Material updated successfully.", inventory });
  } catch (err) {
    console.error("Error updating material:", err);
    return res.status(500).json({ error: err.message });
  }
};

// ✅ Delete Inventory
exports.deleteInventory = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const deleted = await inventoryEntry.destroy({ where: { id, userId } });

    if (!deleted) {
      return res.status(404).json({ error: "Inventory not found or unauthorized access." });
    }

    return res.status(200).json({ message: "Inventory deleted successfully." });
  } catch (err) {
    console.error("Error deleting inventory:", err);
    return res.status(500).json({ error: err.message });
  }
};

// ✅ Get Material Master (User-Specific)
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

// ✅ Get Unit Type (User-Specific)
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

// ✅ Get Vendor Details (User-Specific)
exports.getVendorDetails = async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(400).json({ error: "User ID not found" });
  }

  try {
    const vendorDetails = await vendor.findAll({ where: { userId } });
    res.json(vendorDetails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
