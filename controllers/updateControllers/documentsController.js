const DocumentsMaster = require('../../models/updateModels/documentsUploadSchema');
const { uploadToR2 } = require('../../uploads/r2Uploader');
const { ValidationError } = require('sequelize');
const s3 = require('../../config/r2config');
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_ENDPOINT = process.env.R2_ENDPOINT;
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
exports.upload = upload;

// Other required imports...

const PUBLIC_R2_BASE_URL = process.env.PUBLIC_R2_BASE_URL;

// ✅ Correct URL builder
const getR2FileUrl = (key) => `${PUBLIC_R2_BASE_URL}/${key}`;


// ✅ Create
exports.createDocumentsDetails = async (req, res) => {
  try {
    const { documentTypes } = req.body;
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

    const uploadedFiles = await uploadToR2(filesWithDocTypes, "documents_master", "system_upload");
    const uploadedKeys = uploadedFiles.map(file => file.key);
    const documentsUpload = uploadedKeys.join(',');


    const newDocuments = await DocumentsMaster.create({ documentsUpload });

    res.status(201).json(newDocuments);
  } catch (err) {
    console.error('Error creating documents:', err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Read
exports.getDocumentsDetails = async (req, res) => {
  try {
    const documentsDetails = await DocumentsMaster.findAll();

    const formatted = documentsDetails.map(doc => ({
      ...doc.toJSON(),
      documentsUpload: doc.documentsUpload
        ? doc.documentsUpload.split(',').map(getR2FileUrl)
        : []
    }));

    res.status(200).json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Update
exports.updateDocumentsDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { documentTypes, retainedFiles } = req.body;

    const documents = await DocumentsMaster.findOne({ where: { id } });
    if (!documents) {
      return res.status(404).json({ error: "Documents not found" });
    }

    // Parse retained file keys
    let retainedFileKeys = [];
    try {
      retainedFileKeys = typeof retainedFiles === 'string' ? JSON.parse(retainedFiles) : [];
    } catch (err) {
      return res.status(400).json({ error: 'Invalid retainedFiles format' });
    }

    const oldDocs = documents.documentsUpload ? documents.documentsUpload.split(',') : [];
    const filesToDelete = oldDocs.filter((key) => !retainedFileKeys.includes(key));

    // ✅ Delete removed files from R2
    if (filesToDelete.length > 0) {
      await s3.deleteObjects({
        Bucket: R2_BUCKET_NAME,
        Delete: {
          Objects: filesToDelete.map(key => ({ Key: key })),
          Quiet: true
        }
      }).promise();
    }

    // ✅ Upload new files (if any)
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
        documentType: parsedDocTypes[i] || 'unknown'
      }));

      const uploadedFiles = await uploadToR2(filesWithDocTypes, "documents_master_edit", "system_edit");
      newUploadedKeys = uploadedFiles.map(file => file.key); // 🔧 Extract keys only
    }


    // 🧠 Merge retained + new
    const finalDocs = [...retainedFileKeys, ...newUploadedKeys];

    await documents.update({
      documentsUpload: finalDocs.join(',')
    });

    res.status(200).json(documents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Delete
exports.deleteDocumentsDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const documents = await DocumentsMaster.findOne({ where: { id } });
    if (!documents) return res.status(404).json({ error: "Documents not found" });

    const oldKeys = documents.documentsUpload ? documents.documentsUpload.split(',') : [];

    if (oldKeys.length > 0) {
      await s3.deleteObjects({
        Bucket: R2_BUCKET_NAME,
        Delete: {
          Objects: oldKeys.map((key) => ({ Key: key })),
          Quiet: true
        }
      }).promise();
    }

    await DocumentsMaster.destroy({ where: { id } });
    res.json({ message: "Documents deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.importDocumentFromExcel = async (req, res) => {
  try {
    const documents = req.body.documents;

    if (!Array.isArray(documents) || documents.length === 0) {
      return res.status(400).json({ success: false, error: "No document records provided." });
    }

    const requiredFields = ["documentTypes"];
    const errors = [];
    const cleanedDocuments = [];

    documents.forEach((record, index) => {
      const rowErrors = [];

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

      if (rowErrors.length === 0) {
        cleanedDocuments.push({
          documentTypes: String(record.documentTypes).trim(),
        });
      } else {
        errors.push(...rowErrors);
      }
    });

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation errors in uploaded Excel data.",
        errors
      });
    }

    const created = await DocumentsMaster.bulkCreate(cleanedDocuments, {
      validate: true,
      individualHooks: true
    });

    res.status(201).json({
      success: true,
      message: "Documents imported successfully.",
      count: created.length
    });

 } catch (err) {
   
   console.error("Document import error:", err);
    if (err instanceof ValidationError) {
        const messages = err.errors.map((e) => e.message);
        return res.status(400).json({ success: false, error: messages.join(', ') });
        // return res.status(400).json({ success: false, error: "Fail to Upload"});
    }
    // return res.status(500).json({
    //     success: false,
    //     message:
    //         typeof err?.message === "string"
    //             ? err.message
    //             : JSON.stringify(err)
    // });
}

};
