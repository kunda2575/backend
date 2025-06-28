const { Op } = require('sequelize');
const inventoryEntry = require('../../models/transactionModels/inventoryEntryModel');
const unitType = require("../../models/updateModels/unitTypeSchema");
const vendor = require('../../models/updateModels/vendorMasterSchema');
const materialMaster = require('../../models/updateModels/materialMasterSchema');

const { ValidationError } = require('sequelize');

const fs = require("fs");

const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require('uuid');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../../uploads");

    // Check if directory exists, if not create it
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true }); // ✅ Create parent directories too
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
     const ext = path.extname(file.originalname);
     const uniqueName = `${file.fieldname}-${uuidv4()}${ext}`; // ✅ use uuid
     cb(null, uniqueName);
   },
});


// ✅ Create Inventory Entry
const  createInventoryEntry = async (req, res) => {
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
    
    });

    res.status(201).json({ success: true, data: newEntry });
  } catch (error) {
    if (err instanceof ValidationError) {
      const messages = err.errors.map((e) => e.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Get Inventory Details (Filtered)
const  getInventaryDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 10;

    const conditions = [];
     const parseArray = (value) => value ? value.split(',') : [];

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

   
    let whereClause = {};
    if (conditions.length > 0) {
      whereClause = {
        [Op.and]: [{ [Op.or]: conditions }]
      };
    }


    const inventoryDetails = await inventoryEntry.findAll({
      where: whereClause, offset: skip, limit
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
const  getInventoryById = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const inventory = await inventoryEntry.findOne({ where: { id } });

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


const  updateInventory = async (req, res) => {
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
      entered_by
    } = req.body;

    const inventory = await inventoryEntry.findOne({ where: { id } });

    if (!inventory) {
      return res.status(404).json({ error: "Inventory not found or unauthorized access." });
    }

    // ✅ Handle invoice file attachment
    const files = req.files || [];
    let invoiceAttachments;

    if (files.length > 0) {
      // Delete old attachments (optional cleanup)
      const oldFiles = inventory.invoice_attachment ? inventory.invoice_attachment.split(',') : [];
      oldFiles.forEach((file) => {
        const filePath = path.join(__dirname, "../../uploads", file);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });

      // Save new uploaded files
      invoiceAttachments = files.map(file => file.filename).join(",");
    } else {
      // If no new file, keep the old filenames
      invoiceAttachments = inventory.invoice_attachment;
    }

    // ✅ Update the record
    await inventory.update({
      material_id,
      material_name,
      invoice_date,
      vendor_name,
      invoice_number,
      invoice_cost_incl_gst,
      unit_type,
      quantity_received,
      invoice_attachment: invoiceAttachments,
      entered_by
    });

    return res.status(200).json({ message: "Material updated successfully.", inventory });
  } catch (err) {
    console.error("Error updating inventory:", err);

    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        error: `Invoice number '${req.body.invoice_number}' already exists.`
      });
    }

    return res.status(500).json({ error: err.message });
  }
};

// ✅ Delete Inventory
const  deleteInventory = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const deleted = await inventoryEntry.destroy({ where: { id } });

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
const  getMaterialMasterDetails = async (req, res) => {
  const userId = req.userId;
  // if (!userId) {
  //   return res.status(400).json({ error: "User ID not found" });
  // }

  try {
    const materialDetails = await materialMaster.findAll();
    res.json(materialDetails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get Unit Type (User-Specific)
const  getUnitTypeDetails = async (req, res) => {
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

// ✅ Get Vendor Details (User-Specific)
const  getVendorDetails = async (req, res) => {
  const userId = req.userId;
  // if (!userId) {
  //   return res.status(400).json({ error: "User ID not found" });
  // }

  try {
    const vendorDetails = await vendor.findAll();
    res.json(vendorDetails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// Add this at the bottom of inventoryEntry controller file

const multerInstance = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

module.exports = {
  createInventoryEntry,
  getInventaryDetails,
  getMaterialMasterDetails,
  getUnitTypeDetails,
  getVendorDetails,
  getInventoryById,
  updateInventory,
  deleteInventory,
  upload: multerInstance // ✅ Export the correctly configured multer
};
