const { Op } = require('sequelize');
const inventoryEntry = require('../../models/transactionModels/inventoryEntryModel');
const materialMaster = require("../../models/updateModels/materialMasterSchema");
const unitType = require("../../models/updateModels/unitTypeSchema");
const vendor = require('../../models/updateModels/vendorMasterSchema')

// Create inventoryEntry
exports.createInventory = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(400).json({ error: "User ID is required." });
        }

        const { material_id, material_name, invoice_date, vendor_name, invoice_number, invoice_cost_incl_gst, unit_type, quantity_received, invoice_attachment, entered_by } = req.body;
        // if (!material_id || !material_name || !unit_type ||vendor_name) {
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

        const whereClause = conditions.length > 0 ? { [Op.and]: conditions } : {};

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
