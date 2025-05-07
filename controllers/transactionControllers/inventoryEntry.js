const { Op } = require('sequelize');
const inventoryEntry = require('../../models/transactionModels/inventoryEntryModel');
const unitType = require("../../models/updateModels/unitTypeSchema");
const vendor = require('../../models/updateModels/vendorMasterSchema');
const materialMaster = require('../../models/updateModels/materialMasterSchema');

// Create inventoryEntry
exports.createInventory = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(400).json({ error: "User ID is required." });
        }

        const { material_id, material_name, invoice_date, vendor_name, invoice_number, invoice_cost_incl_gst, unit_type, quantity_received, invoice_attachment, entered_by } = req.body;
        // if (!inventory_id || !inventory_name || !unit_type ||vendor_name) {
        //   return res.status(400).json({ error: "Material ID, Name, and Unit Type are required." });
        // }

        const newInventory = await inventoryEntry.create({
            material_id,
            material_name,
            invoice_date,
            vendor_name,
            invoice_number,
            invoice_cost_incl_gst,
            unit_type,
            quantity_received,
            invoice_attachment,
            entered_by,
            userId
        });

        return res.status(201).json(newInventory);
    } catch (err) {
        console.error("Error creating inventory:", err);
        return res.status(500).json({ error: err.message });
    }
};

// Get Material Details with filtering and pagination
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


        // Combine userId with other conditions using Op.and
        let whereClause = { userId: userId }; // base condition

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

        const inventoryDetailsCount = await inventoryEntry.count({ where: whereClause });

        return res.status(200).json({ inventoryDetails, inventoryDetailsCount });
    } catch (err) {
        console.error("Error fetching inventory details:", err);
        return res.status(500).json({ error: "Failed to fetch inventory details. Please try again later." });
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

// Get Vendor Details (user-specific)
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

// ✅ Get Inventory by ID
exports.getInventoryById = async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;

        const inventory = await inventoryEntry.findOne({ where: { id, userId } });

        if (!inventory) {
            return res.status(404).json({ error: "Material not found or unauthorized access." });
        }

        return res.status(200).json(inventory);
    } catch (err) {
        console.error("Error fetching inventory by ID:", err);
        return res.status(500).json({ error: err.message });
    }
};


// ✅ Update Material
exports.updateInventory = async (req, res) => {
    try {
      const userId = req.userId;
      const { id } = req.params; // Primary key (assumed)
      const { material_id, material_name, invoice_date, vendor_name, invoice_number, invoice_cost_incl_gst, unit_type, quantity_received, invoice_attachment, entered_by } = req.body;
  
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
        invoice_attachment,
        entered_by
      });
  
      return res.status(200).json({ message: "Material updated successfully.", inventory });
    } catch (err) {
      console.error("Error updating material:", err);
      return res.status(500).json({ error: err.message });
    }
  };

// ✅ Delete Material
exports.deleteInventory = async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params; // Primary key (assumed)

        const deleted = await inventoryEntry.destroy({ where: { id, userId } });

        if (!deleted) {
            return res.status(404).json({ error: "Inventory not found or unauthorized access." });
        }

        // await inventory.destroy();

        return res.status(200).json({ message: "Inventory deleted successfully." });
    } catch (err) {
        console.error("Error deleting inventory:", err);
        return res.status(500).json({ error: err.message });
    }
};
