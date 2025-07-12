const { Op } = require('sequelize');
const inventoryEntry = require('../../models/transactionModels/inventoryEntryModel');
const unitType = require("../../models/updateModels/unitTypeSchema");
const vendor = require('../../models/updateModels/vendorMasterSchema');
const materialMaster = require('../../models/updateModels/materialMasterSchema');
const { ValidationError } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const multer = require("multer");

const s3 = require('../../config/r2config');
const { uploadToR2 } = require('../../uploads/r2Uploader');

const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_ENDPOINT = process.env.R2_ENDPOINT;

const PUBLIC_R2_BASE_URL = process.env.PUBLIC_R2_BASE_URL;

// ✅ Correct URL builder
const getR2FileUrl = (key) => `${PUBLIC_R2_BASE_URL}/${key}`;

// ✅ Multer memory storage for direct upload to R2
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

// ✅ Create Inventory Entry
const createInventoryEntry = async (req, res) => {
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
      documentTypes
    } = req.body;

     const files = req.files || [];

    let parsedDocTypes = [];
    try {
      parsedDocTypes = typeof documentTypes === 'string' ? JSON.parse(documentTypes) : [];
    } catch (err) {
      return res.status(400).json({ error: 'Invalid documentTypes format' });
    }

    const filesWithDocTypes = files.map((file, i) => ({
      ...file,
      documentType: parsedDocTypes[i] || 'unknown'
    }));

   
    const uploadedFiles = await uploadToR2(filesWithDocTypes, "inventory_docs", "invoice_upload");
   

    const uploadedKeys = uploadedFiles.map(file => file.key);
    const invoiceAttachments = uploadedKeys.join(',');

    const newEntry = await inventoryEntry.create({
      material_id,
      material_name,
      vendor_name,
      invoice_number,
      invoice_date,
      invoice_cost_incl_gst,
      unit_type,
      quantity_received,
      invoice_attachment: invoiceAttachments,
      entered_by
    });

    res.status(201).json({ ...newEntry.toJSON(),
      documentUrls: uploadedFiles.map(f => f.url)});
  } catch (err) {
    if (err instanceof ValidationError) {
      const messages = err.errors.map((e) => e.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Get Inventory List
const getInventoryDetails = async (req, res) => {
  try {
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
      whereClause = { [Op.and]: [{ [Op.or]: conditions }] };
    }

    const inventoryDetails = await inventoryEntry.findAll({ where: whereClause, offset: skip, limit });
    const inventoryDetailsCount = await inventoryEntry.count({ where: whereClause });

    const updatedProperties = inventoryDetails.map(entry => ({
      ...entry.toJSON(),
      invoice_attachment: entry.invoice_attachment
        ? entry.invoice_attachment.split(',').map(getR2FileUrl)
        : []
    }));

    return res.status(200).json({ updatedProperties, inventoryDetails, inventoryDetailsCount });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch inventory details." });
  }
};

// ✅ Get Inventory By ID
const getInventoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const entry = await inventoryEntry.findOne({ where: { id } });

    if (!entry) {
      return res.status(404).json({ error: "Inventory not found." });
    }

    const updated = {
      ...entry.toJSON(),
      invoice_attachment: entry.invoice_attachment
        ? entry.invoice_attachment.split(',').map(getR2FileUrl)
        : []
    };

    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ✅ Update Inventory
const updateInventory = async (req, res) => {
  try {
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
      entered_by,
       documentTypes,
      retainedFiles // comma-separated stringified keys
    } = req.body;

    const inventory = await inventoryEntry.findOne({ where: { id } });
    if (!inventory) return res.status(404).json({ error: "Inventory not found" });

    let retainedKeys = [];
    try {
      retainedKeys = typeof retainedFiles === 'string' ? JSON.parse(retainedFiles) : [];
    } catch {
      return res.status(400).json({ error: 'Invalid retainedFiles format' });
    }

    const oldKeys = inventory.invoice_attachment ? inventory.invoice_attachment.split(',') : [];
    const keysToDelete = oldKeys.filter(key => !retainedKeys.includes(key));

    if (keysToDelete.length > 0) {
      await s3.deleteObjects({
        Bucket: R2_BUCKET_NAME,
        Delete: { Objects: keysToDelete.map(k => ({ Key: k })), Quiet: true }
      }).promise();
    }

    const files = req.files || [];
    let newKeys = [];

    if (files.length > 0) {
  const filesWithDocTypes = files.map(file => ({
    ...file,
    documentType: 'invoice'
  }));

  const uploaded = await uploadToR2(filesWithDocTypes, "inventory_docs_edit", "invoice_edit");
  newKeys = uploaded.map(file => file.key); // ✅ Extract keys only
}


    const finalAttachments = [...retainedKeys, ...newKeys];

    await inventory.update({
      material_id,
      material_name,
      invoice_date,
      vendor_name,
      invoice_number,
      invoice_cost_incl_gst,
      unit_type,
      quantity_received,
      invoice_attachment: finalAttachments.join(','),
      entered_by
    });

    
return res.status(200).json({
  message: "Inventory updated successfully.",
  inventory: {
    ...inventory.toJSON(),
    invoice_attachment: finalAttachments.map(getR2FileUrl)
  }
});
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ✅ Delete Inventory
const deleteInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const inventory = await inventoryEntry.findOne({ where: { id } });

    if (!inventory) return res.status(404).json({ error: "Inventory not found" });

    const keys = inventory.invoice_attachment ? inventory.invoice_attachment.split(',') : [];
    if (keys.length > 0) {
      await s3.deleteObjects({
        Bucket: R2_BUCKET_NAME,
        Delete: { Objects: keys.map(k => ({ Key: k })), Quiet: true }
      }).promise();
    }

    await inventoryEntry.destroy({ where: { id } });
    return res.json({ message: "Inventory deleted successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};






function excelDateToJSDate(serial) {
  // Excel's base date is 1899-12-30
  const excelEpoch = new Date(1899, 11, 30);
  const jsDate = new Date(excelEpoch.getTime() + serial * 86400000);
  return jsDate;
}
const importInventoryFromExcel = async (req, res) => {
  try {
    const inventoryItems = req.body.inventorys; // array of inventory records from frontend

    if (!Array.isArray(inventoryItems) || inventoryItems.length === 0) {
      return res.status(400).json({ error: "No inventory data provided." });
    }

    // Validate & parse dates & numbers, trim strings, etc.
    const cleanedData = [];
    const errors = [];

    inventoryItems.forEach((item, index) => {
      const err = [];

      // Trim strings and required fields check
      ['material_id', 'material_name', 'vendor_name', 'invoice_number', 'unit_type', 'entered_by'].forEach(field => {
        if (item[field]) item[field] = item[field].toString().trim();
        else err.push({ field, error: `${field} is missing`, row: index + 1 });
      });

      // Parse date fields (invoice_date)
      if (item.invoice_date) {
        const date = typeof item.invoice_date === 'number' ? excelDateToJSDate(item.invoice_date) : new Date(item.invoice_date);
        if (isNaN(date)) err.push({ field: 'invoice_date', error: 'Invalid date', row: index + 1 });
        else item.invoice_date = date;
      } else err.push({ field: 'invoice_date', error: 'Missing invoice_date', row: index + 1 });

      // Parse numbers
      item.invoice_cost_incl_gst = parseFloat(item.invoice_cost_incl_gst) || 0;
      item.quantity_received = parseFloat(item.quantity_received) || 0;

      if (err.length > 0) errors.push(...err);
      else cleanedData.push(item);
    });

    if (errors.length) return res.status(400).json({ message: "Validation errors", errors });

    const createdInventory = await inventoryEntry.bulkCreate(cleanedData, { validate: true });

    return res.status(201).json({ message: "Inventory imported successfully", count: createdInventory.length });
  } catch (err) {
    console.error("Bulk inventory import error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};




// ✅ Master APIs
const getMaterialMasterDetails = async (_, res) => {
  try {
    const materialDetails = await materialMaster.findAll();
    res.json(materialDetails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getUnitTypeDetails = async (_, res) => {
  try {
    const unitTypeDetails = await unitType.findAll();
    res.json(unitTypeDetails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getVendorDetails = async (_, res) => {
  try {
    const vendorDetails = await vendor.findAll();
    res.json(vendorDetails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};






module.exports = {
  createInventoryEntry,
  getInventoryDetails,
  getInventoryById,
  updateInventory,
  deleteInventory,
  getMaterialMasterDetails,
  getUnitTypeDetails,
  getVendorDetails,
  importInventoryFromExcel,
  upload
};
