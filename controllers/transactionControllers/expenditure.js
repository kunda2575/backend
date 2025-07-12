const { Op } = require('sequelize');
const Expenditure = require('../../models/transactionModels/expenditureModel');
const Vendor = require('../../models/updateModels/vendorMasterSchema');
const Expense = require('../../models/updateModels/expenseCategoryMasterSchema');
const PaymentMode = require('../../models/updateModels/paymentModeMasterSchema');
const PaymentBank = require('../../models/updateModels/bankMasterSchema');
const { ValidationError } = require('sequelize')

const s3 = require('../../config/r2config');
const { uploadToR2 } = require('../../uploads/r2Uploader');

const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_ENDPOINT = process.env.R2_ENDPOINT;

const PUBLIC_R2_BASE_URL = process.env.PUBLIC_R2_BASE_URL;

// ✅ Correct URL builder
const getR2FileUrl = (key) => `${PUBLIC_R2_BASE_URL}/${key}`;

// ✅ Create
const createExpenditure = async (req, res) => {
  try {
    const {
      date, vendor_name, expense_head, amount_inr,
      invoice_number, payment_mode, payment_bank,
      documentTypes, documentTypes1
    } = req.body;

    // Parse documentTypes arrays
    const docTypes = typeof documentTypes === 'string' ? JSON.parse(documentTypes) : documentTypes || [];
    const docTypes1 = typeof documentTypes1 === 'string' ? JSON.parse(documentTypes1) : documentTypes1 || [];

    const fileFields = req.files || {};

    // Combine files with their respective document types
    const paymentReferenceFiles = (fileFields.payment_reference_files || []).map((file, i) => ({
      ...file,
      documentType: docTypes[i] || 'reference'
    }));

    const paymentEvidenceFiles = (fileFields.payment_evidence_files || []).map((file, i) => ({
      ...file,
      documentType: docTypes1[i] || 'evidence'
    }));

    const allFiles = [...paymentReferenceFiles];
    const allFiles1 = [...paymentEvidenceFiles];

    // Upload to R2
    const uploaded = await uploadToR2(allFiles, 'payment_reference',vendor_name);
    const uploadedKeys = uploaded.map(f => f.key).join(',');
    const uploaded1 = await uploadToR2(allFiles1, 'payment_evidence',vendor_name);
    const uploadedKeys1 = uploaded1.map(f => f.key).join(',');

    // Create Expenditure record
    const record = await Expenditure.create({
      date,
      vendor_name,
      expense_head,
      amount_inr,
      invoice_number,
      payment_mode,
      payment_bank,
      payment_reference: uploadedKeys,
      payment_evidence: uploadedKeys1,
    });

    console.log("uploaded data", record);
    res.status(201).json(record);

  } catch (err) {
    if (err instanceof ValidationError) {
      return res.status(400).json({ error: err.errors.map(e => e.message).join(', ') });
    }
    return res.status(500).json({ error: err.message });
  }
};


// ✅ Get All (with filters)
const getExpenditureDetails = async (req, res) => {
  try {
    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const parseArr = v => v ? v.split(',') : [];

    const filters = [
      req.query.vendor_name && { vendor_name: { [Op.in]: parseArr(req.query.vendor_name) } },
      req.query.expense_head && { expense_head: { [Op.in]: parseArr(req.query.expense_head) } },
      req.query.payment_mode && { payment_mode: { [Op.in]: parseArr(req.query.payment_mode) } },
      req.query.payment_bank && { payment_bank: { [Op.in]: parseArr(req.query.payment_bank) } }
    ].filter(Boolean);

    const whereClause = filters.length
      ? { [Op.and]: [{ [Op.or]: filters }] }
      : {};

    const data = await Expenditure.findAll({ where: whereClause, offset: skip, limit });
    const count = await Expenditure.count({ where: whereClause });

    const formatted = data.map(item => {
      const json = item.toJSON();
      return {
        ...json,
        payment_reference: json.payment_reference
          ? json.payment_reference.split(',').map(getR2FileUrl)
          : [],
        payment_evidence: json.payment_evidence
          ? json.payment_evidence.split(',').map(getR2FileUrl)
          : []
      };
    });

    res.json({ expenditureDetails: formatted, expenditureDetailsCount: count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch details." });
  }
};

// ✅ Get by ID
const getExpenditureById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!/^\d+$/.test(id)) return res.status(400).json({ error: "Invalid ID" });

    const record = await Expenditure.findByPk(id);
    if (!record) return res.status(404).json({ error: "Not found" });

    const json = record.toJSON();
    return res.json({
      data: {
        ...json,
        payment_reference: json.payment_reference
          ? json.payment_reference.split(',').map(getR2FileUrl)
          : [],
        payment_evidence: json.payment_evidence
          ? json.payment_evidence.split(',').map(getR2FileUrl)
          : [],
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
const updateExpenditure = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Expenditure.findByPk(id);
    if (!existing) return res.status(404).json({ error: "Not found" });

    const fileFields = req.files || {};

    const documentTypes = JSON.parse(req.body.documentTypes || '[]');
    const documentTypes1 = JSON.parse(req.body.documentTypes1 || '[]');

    // === Payment Reference Files ===
    const refFiles = (fileFields.payment_reference_files || []).map((file, i) => ({
      ...file,
      documentType: documentTypes[i] || 'Invoice'
    }));

    let paymentReferenceKeys = (existing.payment_reference || '').split(',').filter(Boolean);
    if (refFiles.length) {
      refFiles.forEach(f => deleteFromR2(f.key)); // cleanup old
      const uploadedRefs = await uploadToR2(refFiles, 'payment_reference', req.body.vendor_name);
      paymentReferenceKeys = uploadedRefs.map(f => f.key);
    }

    // === Payment Evidence Files ===
    const evdFiles = (fileFields.payment_evidence_files || []).map((file, i) => ({
      ...file,
      documentType: documentTypes1[i] || 'Receipt'
    }));

    let paymentEvidenceKeys = (existing.payment_evidence || '').split(',').filter(Boolean);
    if (evdFiles.length) {
      evdFiles.forEach(f => deleteFromR2(f.key));
      const uploadedEvd = await uploadToR2(evdFiles, 'payment_evidence', req.body.vendor_name);
      paymentEvidenceKeys = uploadedEvd.map(f => f.key);
    }

    await existing.update({
      date: req.body.date,
      vendor_name: req.body.vendor_name,
      expense_head: req.body.expense_head,
      amount_inr: req.body.amount_inr,
      invoice_number: req.body.invoice_number,
      payment_mode: req.body.payment_mode,
      payment_bank: req.body.payment_bank,
      payment_reference: paymentReferenceKeys.join(','),
      payment_evidence: paymentEvidenceKeys.join(',')
    });

    return res.json({ message: "Updated", data: existing });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
const deleteExpenditure = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Expenditure.findByPk(id);
    if (!existing) return res.status(404).json({ error: "Not found" });

    const keys = existing.payment_reference ? existing.payment_reference.split(',').filter(Boolean) : [];

    if (keys.length > 0) {
      await s3.deleteObjects({
        Bucket: R2_BUCKET_NAME,
        Delete: { Objects: keys.map(k => ({ Key: k })), Quiet: true }
      }).promise();
    }

    await existing.destroy();
    return res.json({ message: "Deleted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};



const importExpenditureFromExcel = async (req, res) => {
  try {
    const expenditures = req.body.expenditures;

    if (!Array.isArray(expenditures) || expenditures.length === 0) {
      return res.status(400).json({ error: "No expenditure records provided." });
    }

    const requiredFields = [
      "date",
      "vendor_name",
      "expense_head",
      "amount_inr",
      "invoice_number",
      "payment_mode",
      "payment_bank",
      "payment_reference"
    ];

    const errors = [];
    const cleanedExpenditures = [];

    expenditures.forEach((record, index) => {
      const rowErrors = [];

      // ✅ Required field check
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

      // ✅ Validate and format date
      let parsedDate = null;
      if (record.date) {
        if (typeof record.date === "number") {
          const baseDate = new Date(1899, 11, 30);
          parsedDate = new Date(baseDate.getTime() + record.date * 86400000);
        } else {
          const dateMoment = moment(record.date, ['DD-MM-YYYY', 'YYYY-MM-DD'], true);
          if (dateMoment.isValid()) {
            parsedDate = dateMoment.toDate();
          }
        }

        if (!parsedDate || isNaN(parsedDate.getTime())) {
          rowErrors.push({
            row: index + 1,
            field: "date",
            error: "Invalid date format. Use DD-MM-YYYY or Excel serial number."
          });
        }
      }

      if (rowErrors.length === 0) {
        cleanedExpenditures.push({
          date: parsedDate,
          vendor_name: String(record.vendor_name).trim(),
          expense_head: String(record.expense_head).trim(),
          amount_inr: Number(record.amount_inr),
          invoice_number: String(record.invoice_number).trim(),
          payment_mode: String(record.payment_mode).trim(),
          payment_bank: String(record.payment_bank).trim(),
          payment_reference: String(record.payment_reference).trim(),
          payment_evidence: record.payment_evidence ? String(record.payment_evidence).trim() : null
        });
      } else {
        errors.push(...rowErrors);
      }
    });

    if (errors.length > 0) {
      return res.status(400).json({
        message: "Validation errors in uploaded Excel data.",
        errors
      });
    }

    const created = await expenditureModel.bulkCreate(cleanedExpenditures, {
      validate: true,
      individualHooks: true
    });

    return res.status(201).json({
      message: "Expenditures imported successfully.",
      count: created.length
    });

  } catch (err) {
    console.error("Expenditure Import Error:", err);
    return res.status(500).json({ error: "Internal server error during expenditure import." });
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

  createExpenditure,
  getExpenditureDetails,
  getExpenditureById,
  updateExpenditure,
  deleteExpenditure,
  getVendorDetails,
  getExpenseDetails,
  getPaymentModeDetails,
  getPaymentBankDetails,
  importExpenditureFromExcel
};
