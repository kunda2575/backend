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

//  Correct URL builder
const getR2FileUrl = (key) => `${PUBLIC_R2_BASE_URL}/${key}`;

//  Multer memory storage for direct upload to R2
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

//  Create Inventory Entry
const createInventoryEntry = async (req, res) => {
  try {
    const projectId = req.projectId;
    const projectName = req.projectName || 'project';
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

    // Normalize uploaded files
    let files = Array.isArray(req.files)
      ? req.files
      : req.files && typeof req.files === 'object'
        ? Object.values(req.files).flat()
        : req.file
          ? [req.file]
          : [];

    if (!files.length) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    // Parse documentTypes
    let parsedDocTypes = [];
    try {
      parsedDocTypes = typeof documentTypes === 'string'
        ? JSON.parse(documentTypes)
        : documentTypes || [];
    } catch {
      return res.status(400).json({ error: 'Invalid documentTypes format' });
    }

    // Attach doc type info
    const filesWithDocTypes = files.map((file, idx) => ({
      ...file,
      documentType: parsedDocTypes[idx] || 'invoice'
    }));

    // Upload to R2
    const uploadedFiles = await uploadToR2(projectName, filesWithDocTypes, "inventory_docs", "invoice_upload");
    if (!Array.isArray(uploadedFiles)) throw new Error("Upload failed");

    const urls = uploadedFiles.map(file => (file.url || '').replace(/^public_url\s*=\s*/, '')); // ✅ full URLs instead of keys

    // Save full URLs in DB
    const entry = await inventoryEntry.create({
      material_id,
      material_name,
      vendor_name,
      invoice_number,
      invoice_date,
      invoice_cost_incl_gst,
      unit_type,
      quantity_received,
      invoice_attachment: urls.join(','), // ✅ save full URL string
      entered_by,
      projectId
    });

    // Respond with same URLs for frontend
    return res.status(201).json({
      message: "Created successfully",
      data: {
        ...entry.toJSON(),
        documentUrls: urls
      }
    });
  } catch (err) {
    if (err instanceof ValidationError) {
      const messages = err.errors.map(e => e.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    console.error("createInventoryEntry error:", err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
};



//  Get Inventory List
const getInventoryDetails = async (req, res) => {
  try {
    const projectId = req.projectId
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

    let whereClause = { projectId };
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
//  Get Inventory By ID
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
      retainedFiles // array of full URLs or keys
    } = req.body;

    const inventory = await inventoryEntry.findOne({ where: { id } });
    if (!inventory) return res.status(404).json({ error: "Inventory not found" });

    // Normalize retained files (extract keys from URLs if needed)
    let retainedUrls = [];
    try {
      const parsed = typeof retainedFiles === 'string' ? JSON.parse(retainedFiles) : retainedFiles || [];
      retainedUrls = parsed.map(item =>
        item.startsWith('http') ? item : `${PUBLIC_R2_BASE_URL}/${item}`
      );
    } catch {
      return res.status(400).json({ error: 'Invalid retainedFiles format' });
    }

    const oldUrls = (inventory.invoice_attachment || '')
      .split(',')
      .filter(Boolean)
      .map(keyOrUrl => keyOrUrl.startsWith('http') ? keyOrUrl : `${PUBLIC_R2_BASE_URL}/${keyOrUrl}`);

    const oldKeys = oldUrls.map(url => url.replace(`${PUBLIC_R2_BASE_URL}/`, ''));
    const retainedKeys = retainedUrls.map(url => url.replace(`${PUBLIC_R2_BASE_URL}/`, ''));

    // Determine what to delete
    const keysToDelete = oldKeys.filter(key => !retainedKeys.includes(key));
    if (keysToDelete.length > 0) {
      await s3.deleteObjects({
        Bucket: R2_BUCKET_NAME,
        Delete: {
          Objects: keysToDelete.map(key => ({ Key: key })),
          Quiet: true
        }
      }).promise();
    }

    // Handle new uploads
    const files = req.files || [];
    let newUploaded = [];

    if (files.length > 0) {
      let parsedDocTypes = [];
      try {
        parsedDocTypes = typeof documentTypes === 'string' ? JSON.parse(documentTypes) : [];
      } catch {
        return res.status(400).json({ error: 'Invalid documentTypes format' });
      }

      const filesWithTypes = files.map((file, i) => ({
        ...file,
        documentType: parsedDocTypes[i] || 'invoice'
      }));

      newUploaded = await uploadToR2(
        req.projectName || 'project',
        filesWithTypes,
        "inventory_docs_edit",
        "invoice_edit"
      );
    }

    // Combine retained + newly uploaded full URLs
    const allUrls = [
      ...retainedUrls,
      ...newUploaded.map(file =>  (file.url || '').replace(/^public_url\s*=\s*/, ''))
    ];

    await inventory.update({
      material_id,
      material_name,
      invoice_date,
      vendor_name,
      invoice_number,
      invoice_cost_incl_gst,
      unit_type,
      quantity_received,
      invoice_attachment: allUrls.join(','), // ✅ Store full URLs in DB
      entered_by
    });

    return res.status(200).json({
      message: "Inventory updated successfully.",
      inventory: {
        ...inventory.toJSON(),
        invoice_attachment: allUrls
      }
    });
  } catch (err) {
    console.error('Error in updateInventory:', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
};



// Delete Inventory
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
    const projectId = req.projectId
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
      else cleanedData.push(item, projectId);
    });

    if (errors.length) return res.status(400).json({ message: "Validation errors", errors });

    const createdInventory = await inventoryEntry.bulkCreate(cleanedData, { validate: true });

    return res.status(201).json({ message: "Inventory imported successfully", count: createdInventory.length });
  } catch (err) {
    console.error("Bulk inventory import error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};




//  Master APIs
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
