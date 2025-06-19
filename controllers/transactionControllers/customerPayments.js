// ✅ controllers/customerPaymentsController.js

const { Op } = require('sequelize');
const customerPayment = require('../../models/transactionModels/customerPaymentsModel');
const PaymentMode = require('../../models/updateModels/paymentModeMasterSchema');
const paymentType = require('../../models/updateModels/paymentTypeMasterSchema');
const verifiedBy = require('../../models/updateModels/employeeMasterSchema');
const fundingBank = require('../../models/updateModels/bankMasterSchema');
const customer = require('../../models/updateModels/customerMasterSchema');

const fs = require("fs");
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require('uuid');

// ✅ Utility: Delete uploaded files
const deleteFiles = (files) => {
  files.forEach(file => {
    const filePath = path.join(__dirname, "../../uploads", file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  });
};

// ✅ Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../../uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const multerInstance = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

exports.uploadFields = multerInstance.fields([
  { name: 'documents', maxCount: 5 },
]);

// ✅ Create customerPayments
exports.createcustomerPayments = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(400).json({ error: "User ID is required." });

    const {
      customer_id,
      customer_name,
      contact_number,
      email,
      profession,
      native_language,
      project_name,
      block_name,
      flat_no,
      agreed_price,
      installment_no,
      amount_received,
      payment_mode,
      payment_type,
      verified_by,
      funding_bank,
      flat_hand_over_date,
      flat_area,
      no_of_bhk
    } = req.body;

    const document = [];
    const files = req.files || {};
    if (files['documents']) {
      files['documents'].forEach(file => document.push(file.filename));
    }

    const newPayment = await customerPayment.create({
      customer_id,
      customer_name,
      contact_number,
      email,
      profession,
      native_language,
      project_name,
      block_name,
      flat_no,
      agreed_price,
      installment_no,
      amount_received,
      payment_mode,
      payment_type,
      verified_by,
      funding_bank,
      documents: document.join(','),
      flat_hand_over_date,
      flat_area,
      no_of_bhk,
      userId
    });

    return res.status(201).json(newPayment);
  } catch (err) {
    console.error("Error creating payment:", err);
    return res.status(500).json({ error: err.message });
  }
};
exports.getcustomerPaymentsDetails = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(400).json({ error: "User ID is required." });

    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const filters = [];
    const parseArray = (value) => value ? value.split(',') : [];

    if (req.query.payment_type) filters.push({ payment_type: { [Op.in]: parseArray(req.query.payment_type) } });
    if (req.query.verified_by) filters.push({ verified_by: { [Op.in]: parseArray(req.query.verified_by) } });
    if (req.query.payment_mode) filters.push({ payment_mode: { [Op.in]: parseArray(req.query.payment_mode) } });
    if (req.query.funding_bank) filters.push({ funding_bank: { [Op.in]: parseArray(req.query.funding_bank) } });

    let whereClause = { userId };
    if (filters.length > 0) {
      whereClause = {
        userId,
        [Op.and]: filters
      };
    }

    console.log("🔍 whereClause:", whereClause);

    const data = await customerPayment.findAll({
      where: whereClause,
      offset: skip,
      limit: limit
    });

    const mapped = data.map(item => ({
      ...item.toJSON(),
      documents: item.documents ? item.documents.split(',').map(file => `http://localhost:2026/uploads/${file}`) : []
    }));

    const count = await customerPayment.count({ where: whereClause });

    return res.status(200).json({ data: mapped, count });
  } catch (err) {
    console.error("Fetch error:", err);
    return res.status(500).json({ error: err.message });
  }
};

// ✅ GET by ID
exports.getcustomerPaymentsById = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const item = await customerPayment.findOne({ where: { id, userId } });
    if (!item) return res.status(404).json({ error: "Not found" });

    const formatted = {
      ...item.toJSON(),
      documents: item.documents ? item.documents.split(',').map(file => `http://localhost:2026/uploads/${file}`) : []
    };

    return res.status(200).json(formatted);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
exports.updatecustomerPayments = async (req, res) => {
  try {
    console.log("Update customerPayments called");
    console.log("req.user:", req.user);
    console.log("req.params.id:", req.params.id);
    console.log("req.body:", req.body);

    const userId = req.userId;
    const { id } = req.params;

    const {
      customer_id,
      customer_name,
      contact_number,
      email,
      profession,
      native_language,
      project_name,
      block_name,
      flat_no,
      agreed_price,
      installment_no,
      amount_received,
      payment_mode,
      payment_type,
      verified_by,
      funding_bank,
      flat_hand_over_date,
      flat_area,
      no_of_bhk,
    } = req.body;

    const customerPaymentsToUpdate = await customerPayment.findOne({
      where: { id, userId },
    });

    if (!customerPaymentsToUpdate) {
      return res
        .status(404)
        .json({ error: "Customer payment not found or unauthorized access." });
    }

    // Handle document file update
    const oldReferences = customerPaymentsToUpdate.documents
      ? customerPaymentsToUpdate.documents.split(',')
      : [];

    const newReferences = req.files?.documents?.map((file) => file.filename) || [];

    let finalReferences = oldReferences;

    if (newReferences.length > 0) {
      // Optional: delete old files from storage
      deleteFiles(oldReferences);
      finalReferences = newReferences;
    }

    await customerPaymentsToUpdate.update({
      customer_id,
      customer_name,
      contact_number,
      email,
      profession,
      native_language,
      project_name,
      block_name,
      flat_no,
      agreed_price,
      installment_no,
      amount_received,
      payment_mode,
      payment_type,
      verified_by,
      funding_bank,
      documents: finalReferences.join(','), // Save as comma-separated string
      flat_hand_over_date,
      flat_area,
      no_of_bhk,
    });

    // Send response with documents as array
    return res.status(200).json({
      message: "Customer payment updated successfully.",
      data: {
        ...customerPaymentsToUpdate.toJSON(),
        documents: finalReferences, // Return as array to frontend
      },
    });
  } catch (err) {
    console.error("Error updating customerPayments:", err.message, err.stack);
    return res.status(500).json({ error: err.message });
  }
};

// ✅ Delete customerPayments
exports.deletecustomerPayments = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const deleted = await customerPayment.destroy({ where: { id, userId } });

    if (!deleted) {
      return res.status(404).json({ error: "customer Payments not found or unauthorized access." });
    }

    return res.status(200).json({ message: "customer Payments deleted successfully." });
  } catch (err) {
    console.error("Error deleting customerPayments:", err);
    return res.status(500).json({ error: err.message });
  }
};

// ✅ Get payment_type details (user-specific)
exports.getpaymentTypeDetails = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(400).json({ error: "User ID not found" });

    const paymentTypes = await paymentType.findAll({ where: { userId } });
    res.json(paymentTypes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get purpose details (user-specific)
exports.getVerifiedByDetails = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(400).json({ error: "User ID not found" });

    const verifiedByDetails = await verifiedBy.findAll({ where: { userId } });
    res.json(verifiedByDetails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get purpose details (user-specific)
exports.getfundingBankDetails = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(400).json({ error: "User ID not found" });

    const fundingByDetails = await fundingBank.findAll({ where: { userId } });
    res.json(fundingByDetails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get payment mode details (user-specific)
exports.getPaymentModeDetails = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(400).json({ error: "User ID not found" });

    const paymentModeDetails = await PaymentMode.findAll({ where: { userId } });
    res.json(paymentModeDetails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get payment mode details (user-specific)
exports.getCustomerDetails = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(400).json({ error: "User ID not found" });

    const customerDetails = await customer.findAll({ where: { userId } });
    res.json(customerDetails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


