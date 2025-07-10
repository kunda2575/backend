const CustomerMaster = require('../../models/updateModels/customerMasterSchema');
const Lead = require('../../models/transactionModels/leadsModel');
const { uploadToR2 } = require('../../uploads/r2Uploader');
const s3 = require('../../config/r2config');

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
      blockNo,
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
      blockNo,
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
      blockNo,
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
      blockNo: blockNo ?? customer.blockNo,
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
