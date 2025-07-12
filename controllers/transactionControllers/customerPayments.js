const moment = require('moment');
const { Op, ValidationError } = require('sequelize');
const customerPayment = require('../../models/transactionModels/customerPaymentsModel');
const PaymentMode = require('../../models/updateModels/paymentModeMasterSchema');
const paymentType = require('../../models/updateModels/paymentTypeMasterSchema');
const verifiedBy = require('../../models/updateModels/employeeMasterSchema');
const fundingBank = require('../../models/updateModels/bankMasterSchema');
const customer = require('../../models/updateModels/customerMasterSchema');
const { uploadToR2 } = require('../../uploads/r2Uploader');
const s3 = require('../../config/r2config');

const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_ENDPOINT = process.env.R2_ENDPOINT;

// Other required imports...

const PUBLIC_R2_BASE_URL = process.env.PUBLIC_R2_BASE_URL;

// ✅ Correct URL builder
const getR2FileUrl = (key) => `${PUBLIC_R2_BASE_URL}/${key}`;

// ✅ CREATE
exports.createcustomerPayments = async (req, res) => {
  try {
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
      documentTypes,
    } = req.body;

    const files = req.files || [];

    if (!files.length) {
      return res.status(400).json({ error: "No files uploaded" });
    }

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

    const uploadedFiles = await uploadToR2(filesWithDocTypes, "customer_Payments_master", customer_name);
    const uploadedKeys = uploadedFiles.map(file => file.key);
    const document = uploadedKeys.join(',');

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
      documents: document,
      flat_hand_over_date,
      flat_area,
      no_of_bhk,
    });

    return res.status(201).json(newPayment);
  } catch (err) {
    if (err instanceof ValidationError) {
      const messages = err.errors.map((e) => e.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    return res.status(500).json({ error: err.message });
  }
};

exports.importCustomerFromExcel = async (req, res) => {
  try {
    const customers = req.body.customers;

    if (!Array.isArray(customers) || customers.length === 0) {
      return res.status(400).json({ error: "No customer records provided." });
    }

    const requiredFields = [
      "customer_id",
      "customer_name",
      "contact_number",
      "email",
      "flat_no",
      "project_name"
    ];

    const dateFields = ["flat_hand_over_date"];

    const cleanedCustomers = [];
    const errors = [];

    customers.forEach((record, index) => {
      const rowErrors = [];

      // ✅ Check required fields
      requiredFields.forEach((field) => {
        const value = record[field];
        if (value === undefined || value === null || String(value).trim() === "") {
          rowErrors.push({
            row: index + 1,
            field,
            error: `${field} is required.`
          });
        }
      });

      // ✅ Convert and validate date fields
      dateFields.forEach((field) => {
        const value = record[field];
        let parsedDate = null;

        if (value !== undefined && value !== null) {
          if (typeof value === "number") {
            const baseDate = new Date(1899, 11, 30);
            parsedDate = new Date(baseDate.getTime() + value * 86400000);
          } else {
            const parsed = moment(value, ["DD-MM-YYYY", "YYYY-MM-DD"], true);
            if (parsed.isValid()) {
              parsedDate = parsed.toDate();
            }
          }

          if (!parsedDate || isNaN(parsedDate.getTime())) {
            rowErrors.push({
              row: index + 1,
              field,
              error: "Invalid date format."
            });
          } else {
            record[field] = parsedDate;
          }
        }
      });

      if (rowErrors.length > 0) {
        errors.push(...rowErrors);
      } else {
        cleanedCustomers.push({
          customer_id: String(record.customer_id).trim(),
          customer_name: String(record.customer_name).trim(),
          contact_number: String(record.contact_number).trim(),
          email: String(record.email || '').trim(),
          profession: String(record.profession || '').trim(),
          native_language: String(record.native_language || '').trim(),
          project_name: String(record.project_name).trim(),
          block_name: String(record.block_name || '').trim(),
          flat_no: String(record.flat_no).trim(),
          agreed_price: parseFloat(record.agreed_price) || 0,
          installment_no: parseInt(record.installment_no) || 0,
          amount_received: parseFloat(record.amount_received) || 0,
          payment_mode: String(record.payment_mode || '').trim(),
          payment_type: String(record.payment_type || '').trim(),
          verified_by: String(record.verified_by || '').trim(),
          funding_bank: String(record.funding_bank || '').trim(),
          documents: String(record.documents || '').trim(),
          flat_hand_over_date: record.flat_hand_over_date || null,
          flat_area: String(record.flat_area || '').trim(),
          no_of_bhk: parseInt(record.no_of_bhk) || 0
        });
      }
    });

    if (errors.length > 0) {
      return res.status(400).json({
        message: "Validation errors in uploaded customer data.",
        errors
      });
    }

    const created = await customerPayment.bulkCreate(cleanedCustomers, {
      validate: true,
      individualHooks: true
    });

    return res.status(201).json({
      message: "Customers imported successfully.",
      count: created.length
    });

  } catch (err) {
    console.error("Import Customers Error:", err);
    return res.status(500).json({ error: "Internal server error during import." });
  }
};


// ✅ GET ALL
exports.getcustomerPaymentsDetails = async (req, res) => {
  try {
    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const filters = [];
    const parseArray = (value) => (value ? value.split(',') : []);

    if (req.query.payment_type) filters.push({ payment_type: { [Op.in]: parseArray(req.query.payment_type) } });
    if (req.query.verified_by) filters.push({ verified_by: { [Op.in]: parseArray(req.query.verified_by) } });
    if (req.query.payment_mode) filters.push({ payment_mode: { [Op.in]: parseArray(req.query.payment_mode) } });
    if (req.query.funding_bank) filters.push({ funding_bank: { [Op.in]: parseArray(req.query.funding_bank) } });

    let whereClause = {};
    if (filters.length > 0) {
      whereClause = {
        [Op.and]: [{ [Op.or]: filters }],
      };
    }

    const data = await customerPayment.findAll({
      where: whereClause,
      offset: skip,
      limit: limit,
    });

    const mapped = data.map((item) => ({
      ...item.toJSON(),
      documents: item.documents ? item.documents.split(',').map(getR2FileUrl) : [],
    }));

    const count = await customerPayment.count({ where: whereClause });

    return res.status(200).json({ data: mapped, count });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ✅ GET BY ID
exports.getcustomerPaymentsById = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await customerPayment.findOne({ where: { id } });
    if (!item) return res.status(404).json({ error: 'Not found' });

    const formatted = {
      ...item.toJSON(),
      documents: item.documents ? item.documents.split(',').map(getR2FileUrl) : [],
    };

    return res.status(200).json(formatted);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ✅ UPDATE
exports.updatecustomerPayments = async (req, res) => {
  try {
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
      documentTypes,
      retainedFiles,
    } = req.body;

    const customerPaymentsToUpdate = await customerPayment.findOne({ where: { id } });
    if (!customerPaymentsToUpdate) {
      return res.status(404).json({ error: 'Customer payment not found' });
    }

    let retainedFileKeys = [];
    try {
      retainedFileKeys = typeof retainedFiles === 'string' ? JSON.parse(retainedFiles) : [];
    } catch (err) {
      return res.status(400).json({ error: 'Invalid retainedFiles format' });
    }

    const oldDocs = customerPaymentsToUpdate.documents ? customerPaymentsToUpdate.documents.split(',') : [];
    const filesToDelete = oldDocs.filter((key) => !retainedFileKeys.includes(key));

    if (filesToDelete.length > 0) {
      await s3
        .deleteObjects({
          Bucket: R2_BUCKET_NAME,
          Delete: {
            Objects: filesToDelete.map((key) => ({ Key: key })),
            Quiet: true,
          },
        })
        .promise();
    }

    const files = req.files || [];
    let newUploadedKeys = [];

    if (files.length > 0) {
      let parsedDocTypes = [];
      try {
        parsedDocTypes = typeof documentTypes === 'string' ? JSON.parse(documentTypes) : [];
      } catch (err) {
        return res.status(400).json({ error: 'Invalid documentTypes format' });
      }

      const filesWithDocTypes = files.map((file, i) => ({
        ...file,
        documentType: parsedDocTypes[i] || 'unknown',
      }));
 const uploadedFiles = await uploadToR2(filesWithDocTypes, "customer_master_edit", "system_edit");
      newUploadedKeys = uploadedFiles.map(file => file.key); 
    }

    const finalDocs = [...retainedFileKeys, ...newUploadedKeys];

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
      documents: finalDocs.join(','),
      flat_hand_over_date,
      flat_area,
      no_of_bhk,
    });

    return res.status(200).json({
      message: 'Customer payment updated successfully.',
      data: {
        ...customerPaymentsToUpdate.toJSON(),
        documents: finalDocs.map(getR2FileUrl),
      },
    });
  } catch (err) {
    console.error('Error updating customerPayments:', err.message);
    return res.status(500).json({ error: err.message });
  }
};

// ✅ DELETE
exports.deletecustomerPayments = async (req, res) => {
  try {
    const { id } = req.params;
    const customerToDelete = await customerPayment.findOne({ where: { id } });
    if (!customerToDelete) return res.status(404).json({ error: 'Customer payment not found' });

    const oldDocs = customerToDelete.documents ? customerToDelete.documents.split(',') : [];

    if (oldDocs.length > 0) {
      await s3
        .deleteObjects({
          Bucket: R2_BUCKET_NAME,
          Delete: {
            Objects: oldDocs.map((key) => ({ Key: key })),
            Quiet: true,
          },
        })
        .promise();
    }

    await customerPayment.destroy({ where: { id } });

    return res.status(200).json({ message: 'Customer payment deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ✅ Master dropdowns
exports.getpaymentTypeDetails = async (req, res) => {
  try {
    const data = await paymentType.findAll();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getVerifiedByDetails = async (req, res) => {
  try {
    const data = await verifiedBy.findAll();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getfundingBankDetails = async (req, res) => {
  try {
    const data = await fundingBank.findAll();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPaymentModeDetails = async (req, res) => {
  try {
    const data = await PaymentMode.findAll();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCustomerDetails = async (req, res) => {
  try {
    const data = await customer.findAll();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
