const CustomerMaster = require('../../models/updateModels/customerMasterSchema');
const Lead = require('../../models/transactionModels/leadsModel');
const { uploadToR2 } = require('../../uploads/r2Uploader');
const s3 = require('../../config/r2config');
const { ValidationError } = require('sequelize');

const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;

const PUBLIC_R2_BASE_URL = process.env.PUBLIC_R2_BASE_URL;

// ✅ Correct URL builder
const getR2FileUrl = (key) => `${PUBLIC_R2_BASE_URL}/${key}`;

// ✅ Create
exports.createCustomerDetails = async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      customerProfession,
      languagesKnown,
      customerNo,
      flatNo,
      documentTypes
    } = req.body;

    if (!customerName || !customerPhone || !customerEmail) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

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

    const uploadedFiles = await uploadToR2(filesWithDocTypes, "customer_master", customerName);
    const documents = uploadedFiles.map(f => f.key).join(',');

    const newCustomer = await CustomerMaster.create({
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      customerProfession,
      languagesKnown,
      customerNo,
      flatNo,
      documents
    });

    res.status(201).json({
      ...newCustomer.toJSON(),
      documentUrls: uploadedFiles.map(f => f.url)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Read all
exports.getCustomerDetails = async (req, res) => {
  try {
    const customers = await CustomerMaster.findAll();

    const formatted = customers.map(cus => {
      const docs = cus.documents ? cus.documents.split(',') : [];
      return {
        ...cus.toJSON(),
        documentUrls: docs.map(getR2FileUrl)
      };
    });

    res.status(200).json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Update
exports.updateCustomersDetails = async (req, res) => {
  try {
    const { customerId } = req.params;
    const {
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      customerProfession,
      languagesKnown,
      customerNo,
      flatNo,
      documentTypes,
      retainedFiles
    } = req.body;

    const customer = await CustomerMaster.findOne({ where: { customerId } });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    let retainedFileKeys = [];
    try {
      retainedFileKeys = typeof retainedFiles === 'string' ? JSON.parse(retainedFiles) : [];
    } catch (err) {
      return res.status(400).json({ error: 'Invalid retainedFiles format' });
    }

    const oldDocs = customer.documents ? customer.documents.split(',') : [];
    const filesToDelete = oldDocs.filter(key => !retainedFileKeys.includes(key));

    if (filesToDelete.length > 0) {
      await s3.deleteObjects({
        Bucket: R2_BUCKET_NAME,
        Delete: {
          Objects: filesToDelete.map(key => ({ Key: key })),
          Quiet: true
        }
      }).promise();
    }

    const files = req.files || [];
    let newUploadedFiles = [];

    if (files.length > 0) {
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

      newUploadedFiles = await uploadToR2(filesWithDocTypes, "customer_master_edit", customerName);
    }

    const finalDocs = [...retainedFileKeys, ...newUploadedFiles.map(f => f.key)];

    await customer.update({
      customerName: customerName ?? customer.customerName,
      customerPhone: customerPhone ?? customer.customerPhone,
      customerEmail: customerEmail ?? customer.customerEmail,
      customerAddress: customerAddress ?? customer.customerAddress,
      customerProfession: customerProfession ?? customer.customerProfession,
      languagesKnown: languagesKnown ?? customer.languagesKnown,
      customerNo: customerNo ?? customer.customerNo,
      flatNo: flatNo ?? customer.flatNo,
      documents: finalDocs.join(',')
    });

    const allUrls = finalDocs.map(getR2FileUrl);

    res.status(200).json({
      message: 'Customer updated successfully',
      data: customer,
      documentUrls: allUrls
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Delete
exports.deleteCustomersDetails = async (req, res) => {
  try {
    const { customerId } = req.params;
    const customer = await CustomerMaster.findOne({ where: { customerId } });

    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    const oldDocs = customer.documents ? customer.documents.split(',') : [];

    if (oldDocs.length > 0) {
      await s3.deleteObjects({
        Bucket: R2_BUCKET_NAME,
        Delete: {
          Objects: oldDocs.map((key) => ({ Key: key })),
          Quiet: true
        }
      }).promise();
    }

    await customer.destroy();
    res.json({ message: 'Customer deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



exports.importCustomerFromExcel = async (req, res) => {
  try {
    const customers = req.body.customer;

    if (!Array.isArray(customers) || customers.length === 0) {
      return res.status(400).json({ error: "No customer records provided." });
    }

    const requiredFields = ["customerName",
      "customerPhone", "customerEmail","customerAddress","customerProfession","languagesKnown","flatNo"
    ];
    const errors = [];
    const cleanedCustomers = [];

    customers.forEach((record, index) => {
      const rowErrors = [];

      // Validate required fields
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

      // Removed any date validation here

      if (rowErrors.length === 0) {
        cleanedCustomers.push({
          customerName: String(record.customerName).trim(),
          customerPhone: String(record.customerPhone).trim(),
          customerEmail: String(record.customerEmail).trim(),
          blockNo: String(record.blockNo).trim(),
          customerAddress: record.customerAddress || null,
          customerProfession: record.customerProfession || null,
          languagesKnown: record.languagesKnown || null,
       
          flatNo: record.flatNo || null
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

    const created = await CustomerMaster.bulkCreate(cleanedCustomers, {
      validate: true,
      individualHooks: true
    });

    res.status(201).json({
      message: "Customers imported successfully.",
      count: created.length
    });

  } catch (err) {
    if (err instanceof ValidationError) {
      const messages = err.errors.map((e) => e.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    console.error("Customer import error:", err);
    res.status(500).json({ error: "Internal server error during customer import." });
  }
};



// ✅ Get single customer for autofill
exports.getCustomerById = async (req, res) => {
  try {
    const { customerId } = req.params;

    const customer = await CustomerMaster.findOne({
      where: { customerId },
      attributes: [
        'customerId',
        'customerName',
        'customerPhone',
        'customerEmail',
        'customerAddress',
        'languagesKnown'
      ]
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.status(200).json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get all leads
exports.getLeadDetails = async (req, res) => {
  try {
    const leads = await Lead.findAll();
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
