const DocumentsMaster = require('../../models/updateModels/documentsUploadSchema');
const { Op } = require("sequelize");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

// 🔐 Multer storage config with UUID
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../../uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${file.fieldname}-${uuidv4()}${ext}`;
    cb(null, filename);
  },
});

exports.upload = multer({ storage });

// ✅ Create
exports.createDocumentsDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const files = req.files || [];

    if (files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const documentsUpload = files.map(file => file.filename).join(',');

    const newDocuments = await DocumentsMaster.create({
      documentsUpload,
      userId
    });

    res.status(201).json(newDocuments);
  } catch (err) {
    console.error('Error creating documents:', err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Read
exports.getDocumentsDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const documentsDetails = await DocumentsMaster.findAll({ where: { userId } });

    const updatedDetails = documentsDetails.map(doc => ({
      ...doc.toJSON(),
      documentsUpload: doc.documentsUpload
        ? doc.documentsUpload.split(",")
        : []
    }));

    res.status(200).json(updatedDetails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Update
exports.updateDocumentsDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const documents = await DocumentsMaster.findOne({ where: { id, userId } });
    if (!documents) {
      return res.status(404).json({ error: "Documents not found" });
    }

    const files = req.files || [];
    let documentsUpload = documents.documentsUpload;

    if (files.length > 0) {
      const oldFiles = documents.documentsUpload ? documents.documentsUpload.split(',') : [];
      oldFiles.forEach(file => {
        const filePath = path.join(__dirname, "../../uploads", file);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });

      documentsUpload = files.map(file => file.filename).join(',');
    }

    documents.documentsUpload = documentsUpload;
    await documents.save();

    res.status(200).json(documents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Delete
exports.deleteDocumentsDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const documents = await DocumentsMaster.findOne({ where: { id, userId } });
    if (!documents) return res.status(404).json({ error: "Documents not found" });

    const oldFiles = documents.documentsUpload ? documents.documentsUpload.split(',') : [];
    oldFiles.forEach(file => {
      const filePath = path.join(__dirname, "../../uploads", file);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });

    await DocumentsMaster.destroy({ where: { id, userId } });
    res.json({ message: "Documents deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
