const { ValidationError } = require('sequelize');
const VendorMaster = require('../../models/updateModels/vendorMasterSchema');

//--------------------------------------------------------------------------------------------------------------

// Create
exports.createVendor = async (req, res) => {
  try {
    const projectId = req.projectId;
    const {vendorId, vendorName,services,phone,address ,city} = req.body;
    const newVendor = await VendorMaster.create({vendorId, vendorName,services,phone,address ,city,projectId});
    res.status(201).json(newVendor);
  } catch (err) {
     if (err instanceof ValidationError) {
      const messages = err.errors.map((e) => e.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
   
  }
};

//--------------------------------------------------------------------------------------------------------------

exports.importVendorsExcelData = async (req, res) => {
  try {
    const vendors = req.body.vendors;
    const projectId = req.projectId
    if (!Array.isArray(vendors) || vendors.length === 0) {
      return res.status(400).json({ error: "No vendor records provided." });
    }

    const requiredFields = ["vendorId", "vendorName", "services", "phone", "address"];
    const errors = [];
    const cleanedVendors = [];

    vendors.forEach((record, index) => {
      const rowErrors = [];

      requiredFields.forEach((field) => {
        if (
          record[field] === undefined ||
          record[field] === null ||
          String(record[field]).trim() === ""
        ) {
          rowErrors.push({
            row: index + 1,
            field,
            error: `${field} is required`
          });
        }
      });

      if (rowErrors.length === 0) {
        cleanedVendors.push({
          vendorId: String(record.vendorId).trim(),
          vendorName: String(record.vendorName).trim(),
          services: String(record.services).trim(),
          phone: String(record.phone).trim(),
          address: String(record.address).trim(),
          city: record.city ? String(record.city).trim() : null,
          projectId
        });
      } else {
        errors.push(...rowErrors);
      }
    });

    if (errors.length > 0) {
      return res.status(400).json({
        message: "Validation errors in uploaded vendor data.",
        errors
      });
    }

    const created = await VendorMaster.bulkCreate(cleanedVendors, {
      validate: true,
      individualHooks: true
    });

    res.status(201).json({
      message: "Vendors imported successfully.",
      count: created.length
    });

  } catch (err) {
    if (err instanceof ValidationError) {
      const messages = err.errors.map((e) => e.message);
      return res.status(400).json({ error: messages.join(', ') });
    }

    console.error("Vendor import error:", err);
    res.status(500).json({ error: "Internal server error during vendor import." });
  }
};


//--------------------------------------------------------------------------------------------------------------

// Read all
exports.getVendors = async (req, res) => {
  try {
    const projectId = req.projectId;
    const vendors = await VendorMaster.findAll({where:{projectId}});
    res.json(vendors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//--------------------------------------------------------------------------------------------------------------

// Update
exports.updateVendor = async (req, res) => {
  try {
    const projectId = req.projectId;
    const { id } = req.params;
    const {vendorId, vendorName,services,phone,address ,city } = req.body;
    const vendor = await VendorMaster.findOne({ where: {id } });
    if (!vendor) return res.status(404).json({ error: "Vendor not found" });

   
    vendor.vendorId=vendorId,
    vendor.vendorName=vendorName,
    vendor.services= services,
    vendor.phone= phone,
    vendor.address= address,
    vendor.city= city
    await vendor.save();

    res.json(vendor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//--------------------------------------------------------------------------------------------------------------

// Delete
exports.deleteVendor = async (req, res) => {
  try {
    const projectId = req.projectId;
    const { id } = req.params;
    const deleted = await VendorMaster.destroy({ where: { id } });
    if (!deleted) return res.status(404).json({ error: "Vendor not found" });
    res.json({ message: "Vendor deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
