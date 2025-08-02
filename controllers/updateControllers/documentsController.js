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

//  Correct URL builder
const getR2FileUrl = (key) => `${PUBLIC_R2_BASE_URL}/${key}`;


//--------------------------------------------------------------------------------------------------------------

exports.createDocumentsDetails = async (req, res) => {
  try {
    const projectId = req.projectId;
    const projectName = req.projectName;
console.log("project name is ",projectName)
    const { documentTypes } = req.body;
    const files = req.files || [];

    console.log("Request body:", req.body);
    console.log("Project ID:", projectId);
    console.log("Files:", files);

    if (!files.length) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    // Parse document types if sent
    let parsedDocTypes = [];
    try {
      parsedDocTypes = typeof documentTypes === 'string'
        ? JSON.parse(documentTypes)
        : [];
    } catch (err) {
      return res.status(400).json({ error: 'Invalid documentTypes format' });
    }

    // Attach documentType to each file (optional)
    const filesWithDocTypes = files.map((file, i) => ({
      ...file,
      documentType: parsedDocTypes[i] || 'unknown'
    }));

    // Upload files to R2
    const uploadedFiles = await uploadToR2(projectName,filesWithDocTypes, "documents_master", "system_upload");
console.log("headers",uploadedFiles)
    // Join all public URLs (not just keys)

    const documentUrls = uploadedFiles.map(file => file.url.replace(/^public_url\s*=\s*/, '')
);

    const documentsUpload = documentUrls.join(',');

    // Save in DB (including full public URLs)
    const newDocuments = await DocumentsMaster.create({
      documentsUpload,
      projectId
    });

    res.status(201).json({
      message: 'Documents uploaded successfully',
      data: newDocuments
    });

  } catch (err) {
    console.error('Error creating documents:', err);
    res.status(500).json({ error: err.message });
  }
};

//--------------------------------------------------------------------------------------------------------------

exports.getDocumentsDetails = async (req, res) => {
  try {
    const projectId = req.projectId;

    const documentsDetails = await DocumentsMaster.findAll({ where: { projectId } });

    const formatted = documentsDetails.map(doc => {
      const docJson = doc.toJSON();
      return {
        ...docJson,
        documentsUpload: docJson.documentsUpload
          ? docJson.documentsUpload.split(',').map(url => url.trim())
          : []
      };
    });

    res.status(200).json(formatted);
  } catch (err) {
    console.error("Error fetching documents:", err);
    res.status(500).json({ error: err.message });
  }
};

//--------------------------------------------------------------------------------------------------------------
exports.updateDocumentsDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { documentTypes, retainedFiles } = req.body;

    // Get project name from middleware (safely fallback)
    const projectName = req.projectName || 'default_project';

    const documents = await DocumentsMaster.findOne({ where: { id } });
    if (!documents) {
      return res.status(404).json({ error: "Documents not found" });
    }

    // Parse retained file URLs
    let retainedFileUrls = [];
    try {
      retainedFileUrls = typeof retainedFiles === 'string'
        ? JSON.parse(retainedFiles)
        : Array.isArray(retainedFiles)
        ? retainedFiles
        : [];
    } catch (err) {
      return res.status(400).json({ error: 'Invalid retainedFiles format' });
    }

    // Get old document URLs
    const oldDocs = documents.documentsUpload
      ? documents.documentsUpload.split(',').map(url => url.trim())
      : [];

    // Find which files to delete
    const filesToDelete = oldDocs.filter(url => !retainedFileUrls.includes(url));

    // Delete from R2 if needed
    if (filesToDelete.length > 0) {
      await s3.deleteObjects({
        Bucket: R2_BUCKET_NAME,
        Delete: {
          Objects: filesToDelete.map(url => ({
            Key: url.replace(`${PUBLIC_R2_BASE_URL}/`, '')
          })),
          Quiet: true
        }
      }).promise();
    }

    // Handle new uploads
    const files = Array.isArray(req.files) ? req.files : [];
    let newUploadedUrls = [];

    if (files.length > 0) {
      let parsedDocTypes = [];
      try {
        parsedDocTypes = typeof documentTypes === 'string'
          ? JSON.parse(documentTypes)
          : [];
      } catch (err) {
        return res.status(400).json({ error: 'Invalid documentTypes format' });
      }

      const filesWithDocTypes = files.map((file, i) => ({
        ...file,
        documentType: parsedDocTypes[i] || 'unknown'
      }));

      const uploadedFiles = await uploadToR2(
        projectName,                  // ✅ Fixed: projectName
        filesWithDocTypes,            // ✅ files array
        "documents_master_edit",      // ✅ masterType
        "system_edit"                 // ✅ folder/customerName
      );

      if (!Array.isArray(uploadedFiles)) {
        return res.status(500).json({ error: 'File upload failed or returned unexpected data' });
      }

      newUploadedUrls = uploadedFiles.map(file =>
        (file.url || '').replace(/^public_url\s*=\s*/, '')
      );
    }

    // Merge retained and new files
   const normalizedRetainedUrls = retainedFileUrls.map(url =>
  url.startsWith('http') ? url : `${PUBLIC_R2_BASE_URL}/${url}`
);

const finalUrls = [...normalizedRetainedUrls, ...newUploadedUrls];


    await documents.update({
      documentsUpload: finalUrls.join(',')
    });

    res.status(200).json(documents);
  } catch (err) {
    console.error('Error updating documents:', err);
    res.status(500).json({ error: err.message });
  }
};


//--------------------------------------------------------------------------------------------------------------

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

//--------------------------------------------------------------------------------------------------------------

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
