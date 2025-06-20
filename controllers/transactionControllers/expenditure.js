const { Op } = require('sequelize');
const Expenditure = require('../../models/transactionModels/expenditureModel');
const Vendor = require('../../models/updateModels/vendorMasterSchema');
const Expense = require('../../models/updateModels/expenseCategoryMasterSchema');
const PaymentMode = require('../../models/updateModels/paymentModeMasterSchema');
const PaymentBank = require('../../models/updateModels/bankMasterSchema');

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

const uploadFields = multerInstance.fields([
  { name: 'payment_reference', maxCount: 1 },
  { name: 'payment_evidence', maxCount: 1 }
]);

// ✅ Create
const createExpenditure = async (req, res) => {
  try {
    const userId = req.userId;
    // if (!userId) return res.status(400).json({ error: "User ID is required." });

    const {
      date, vendor_name, expense_head, amount_inr,
      invoice_number, payment_mode, payment_bank
    } = req.body;

    const payment_references = [];
    const payment_evidences = [];

    const files = req.files || {};
    if (files['payment_reference']) {
      files['payment_reference'].forEach(file => payment_references.push(file.filename));
    }
    if (files['payment_evidence']) {
      files['payment_evidence'].forEach(file => payment_evidences.push(file.filename));
    }

    const newExpenditure = await Expenditure.create({
      date,
      expense_head,
      amount_inr,
      vendor_name,
      invoice_number,
      payment_mode,
      payment_bank,
      payment_reference: payment_references.join(','),
      payment_evidence: payment_evidences.join(','),
    
    });

    return res.status(201).json(newExpenditure);
  } catch (err) {
    console.error("Error creating expenditure:", err);
    return res.status(500).json({ error: err.message });
  }
};

// ✅ Get All (with filters)
const getExpenditureDetails = async (req, res) => {
  try {
    const userId = req.userId;
    // if (!userId) return res.status(400).json({ error: "User ID is required." });

    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 10;

    const filters = [];
    const parseArray = (value) => value ? value.split(',') : [];

    if (req.query.vendor_name) filters.push({ vendor_name: { [Op.in]: parseArray(req.query.vendor_name) } });
    if (req.query.expense_head) filters.push({ expense_head: { [Op.in]: parseArray(req.query.expense_head) } });
    if (req.query.payment_mode) filters.push({ payment_mode: { [Op.in]: parseArray(req.query.payment_mode) } });
    if (req.query.payment_bank) filters.push({ payment_bank: { [Op.in]: parseArray(req.query.payment_bank) } });

    let whereClause = {};
    if (filters.length > 0) {
      whereClause = {
        [Op.and]: [{ [Op.or]: filters }]
      };
    }

    const expenditureDetails = await Expenditure.findAll({ where: whereClause, offset: skip, limit });

    const updatedProperties = expenditureDetails.map(item => ({
      ...item.toJSON(),
      payment_reference: item.payment_reference ? item.payment_reference.split(",").map(img => `http://localhost:2026/uploads/${img}`) : [],
      payment_evidence: item.payment_evidence ? item.payment_evidence.split(",").map(img => `http://localhost:2026/uploads/${img}`) : []
    }));

    const expenditureDetailsCount = await Expenditure.count({ where: whereClause });

    return res.status(200).json({ updatedProperties, expenditureDetails, expenditureDetailsCount });
  } catch (err) {
    console.error("Error fetching expenditure details:", err.message);
    return res.status(500).json({ error: "Failed to fetch expenditure details." });
  }
};

// ✅ Get by ID
const getExpenditureById = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ error: "Invalid ID format. ID must be a number." });
    }

    const expenditure = await Expenditure.findOne();

    if (!expenditure) {
      return res.status(404).json({ error: "Expenditure not found" });
    }

    const updatedProperty = {
      ...expenditure.toJSON(),
      payment_reference: expenditure.payment_reference
        ? expenditure.payment_reference.split(",").map(img => `http://localhost:2026/uploads/${img}`)
        : [],
      payment_evidence: expenditure.payment_evidence
        ? expenditure.payment_evidence.split(",").map(img => `http://localhost:2026/uploads/${img}`)
        : []
    };

    res.status(200).json({ success: true, data: updatedProperty });

  } catch (error) {
    console.error("Error fetching expenditure:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ Update
const updateExpenditure = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const expenditureToUpdate = await Expenditure.findOne({ where: { id } });
    if (!expenditureToUpdate) return res.status(404).json({ error: "Expenditure not found" });

    let oldReferences = expenditureToUpdate.payment_reference ? expenditureToUpdate.payment_reference.split(',') : [];
    let oldEvidences = expenditureToUpdate.payment_evidence ? expenditureToUpdate.payment_evidence.split(',') : [];

    const newReferences = req.files['payment_reference']?.map(f => f.filename) || [];
    const newEvidences = req.files['payment_evidence']?.map(f => f.filename) || [];

    let finalReferences = oldReferences;
    let finalEvidences = oldEvidences;

    if (newReferences.length > 0) {
      deleteFiles(oldReferences);
      finalReferences = newReferences;
    }

    if (newEvidences.length > 0) {
      deleteFiles(oldEvidences);
      finalEvidences = newEvidences;
    }

    await expenditureToUpdate.update({
      date: req.body.date,
      vendor_name: req.body.vendor_name,
      expense_head: req.body.expense_head,
      amount_inr: req.body.amount_inr,
      invoice_number: req.body.invoice_number,
      payment_mode: req.body.payment_mode,
      payment_bank: req.body.payment_bank,
      payment_reference: finalReferences.join(','),
      payment_evidence: finalEvidences.join(',')
    });

    return res.status(200).json({ message: "Expenditure updated successfully.", data: expenditureToUpdate });
  } catch (err) {
    console.error("Error updating expenditure:", err.message);
    return res.status(500).json({ error: err.message });
  }
};

// ✅ Delete
const deleteExpenditure = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const expenditure = await Expenditure.findOne({ where: { id } });
    if (!expenditure) return res.status(404).json({ error: "Expenditure not found or unauthorized access." });

    const refFiles = expenditure.payment_reference ? expenditure.payment_reference.split(',') : [];
    const evidenceFiles = expenditure.payment_evidence ? expenditure.payment_evidence.split(',') : [];
    deleteFiles([...refFiles, ...evidenceFiles]);

    await expenditure.destroy();
    return res.status(200).json({ message: "Expenditure and related files deleted successfully." });
  } catch (err) {
    console.error("Error deleting expenditure:", err);
    return res.status(500).json({ error: err.message });
  }
};

// ✅ Master data APIs
const getVendorDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const vendorDetails = await Vendor.findAll();
    res.json(vendorDetails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getExpenseDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const expenseDetails = await Expense.findAll();
    res.json(expenseDetails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getPaymentModeDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const paymentModeDetails = await PaymentMode.findAll();
    res.json(paymentModeDetails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getPaymentBankDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const paymentBankDetails = await PaymentBank.findAll();
    res.json(paymentBankDetails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Export all
module.exports = {
  uploadFields,
  createExpenditure,
  getExpenditureDetails,
  getExpenditureById,
  updateExpenditure,
  deleteExpenditure,
  getVendorDetails,
  getExpenseDetails,
  getPaymentModeDetails,
  getPaymentBankDetails,
};
