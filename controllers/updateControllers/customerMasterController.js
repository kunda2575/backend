const CustomerMaster = require('../../models/updateModels/customerMasterSchema');
const { uploadToR2 } = require('../../uploads/r2Uploader');
const s3 = require('../../config/r2config');
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;

// ✅ Helper: Generate full R2 URL from object key
const getR2FileUrl = (key) => {
  const endpoint = process.env.R2_ENDPOINT;
  return `${endpoint}/${R2_BUCKET_NAME}/${key}`;
};

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
      projectNameBlock,
      flatNo
    } = req.body;

    if (!customerName || !customerPhone || !customerEmail) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    const files = req.files || [];
    const uploadedKeys = await uploadToR2(files); // Uploads to R2
    const documents = uploadedKeys.join(',');

    const newCustomer = await CustomerMaster.create({
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      customerProfession,
      languagesKnown,
      projectNameBlock,
      flatNo,
      documents
    });
    console.log("werrrrrrrrrrrrrrrrrrrrrrrrrrrrr", documents)
    res.status(201).json(newCustomer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Read
exports.getCustomerDetails = async (req, res) => {
  try {
    const allCustomers = await CustomerMaster.findAll();

    const updated = allCustomers.map(cus => ({
      ...cus.toJSON(),
      documents: cus.documents
        ? cus.documents.split(',').map(key => getR2FileUrl(key))
        : []
    }));

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
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
      projectNameBlock,
      flatNo
    } = req.body;

    const customer = await CustomerMaster.findOne({ where: { customerId } });
    if (!customer) return res.status(404).json({ error: "Customer not found" });

    const oldDocs = customer.documents ? customer.documents.split(',') : [];
    let finalDocs = oldDocs;

    const files = req.files || [];
    if (files.length > 0) {
      // Delete old documents from R2
      if (oldDocs.length > 0) {
        await s3.deleteObjects({
          Bucket: R2_BUCKET_NAME,
          Delete: {
            Objects: oldDocs.map(key => ({ Key: key })),
            Quiet: true
          }
        }).promise();
      }

      // ✅ Upload new files to R2
      const uploadedKeys = await uploadToR2(files);
      finalDocs = uploadedKeys;
    }

    await customer.update({
      customerName: customerName ?? customer.customerName,
      customerPhone: customerPhone ?? customer.customerPhone,
      customerEmail: customerEmail ?? customer.customerEmail,
      customerAddress: customerAddress ?? customer.customerAddress,
      customerProfession: customerProfession ?? customer.customerProfession,
      languagesKnown: languagesKnown ?? customer.languagesKnown,
      projectNameBlock: projectNameBlock ?? customer.projectNameBlock,
      flatNo: flatNo ?? customer.flatNo,
      documents: finalDocs.join(','),
    });

    res.status(200).json({ message: "Customer updated successfully", data: customer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ✅ Delete
exports.deleteCustomersDetails = async (req, res) => {
  try {
    const { customerId } = req.params;
    const customer = await CustomerMaster.findOne({ where: { customerId } });

    if (!customer) return res.status(404).json({ error: "Customer not found" });

    const oldDocs = customer.documents ? customer.documents.split(',') : [];

    if (oldDocs.length > 0) {
      await s3.deleteObjects({
        Bucket: R2_BUCKET_NAME,
        Delete: {
          Objects: oldDocs.map(key => ({ Key: key })),
          Quiet: true
        }
      }).promise();
    }

    await customer.destroy();
    res.json({ message: "Customer deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
