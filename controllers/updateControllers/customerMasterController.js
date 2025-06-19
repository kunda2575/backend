const CustomerMaster = require('../../models/updateModels/customerMasterSchema');
const { Op } = require("sequelize");
const fs = require("fs");
const multer = require("multer");
const path = require("path");

// 🔐 Multer storage config
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

exports.upload = multer({ storage });

// 🔄 Helper to delete old files
const deleteFiles = (filenames) => {
  filenames.forEach(filename => {
    const filePath = path.join(__dirname, "../../uploads", filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  });
};

// ✅ Create
exports.createCustomerDetails = async (req, res) => {
  try {
    const userId = req.userId;
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

    const files = req.files || [];
    const documents = files.map(file => file.filename).join(',');
console.log("📝 Received Body:", req.body);
console.log("📎 Received Files:", req.files);

if (!customerName || !customerPhone || !customerEmail) {
  return res.status(400).json({ error: "Required fields missing" });
}

    const newCustomer = await CustomerMaster.create({
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      customerProfession,
      languagesKnown,
      projectNameBlock,
      flatNo,
      documents,
      userId
    });

    res.status(201).json(newCustomer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Read
exports.getCustomerDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const allCustomers = await CustomerMaster.findAll({ where: { userId } });

    const updated = allCustomers.map(cus => ({
      ...cus.toJSON(),
      documents: cus.documents
        ? cus.documents.split(',').map(f => `http://localhost:2026/uploads/${f}`)
        : []
    }));

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Update
exports.updateCustomersDetails = async (req, res) => {
  try {
    const userId = req.userId;
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

    const customer = await CustomerMaster.findOne({ where: { customerId, userId } });
    if (!customer) return res.status(404).json({ error: "Customer not found" });

    // 🧾 Handle file update
    const oldDocs = customer.documents ? customer.documents.split(',') : [];
  

    const newDocs = req.files?.map(f => f.filename) || [];
let finalDocs = oldDocs;

if (newDocs.length > 0) {
  deleteFiles(oldDocs); // Optional
  finalDocs = newDocs;
}

    // 📝 Update fields
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
    const userId = req.userId;
    const { customerId } = req.params;

    const customer = await CustomerMaster.findOne({ where: { customerId, userId } });
    if (!customer) return res.status(404).json({ error: "Customer not found" });

    const oldDocs = customer.documents ? customer.documents.split(',') : [];
    deleteFiles(oldDocs);

    await customer.destroy();

    res.json({ message: "Customer deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
