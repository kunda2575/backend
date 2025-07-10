const { ValidationError } = require('sequelize');
const ProjectMaster = require('../../models/updateModels/projectMasterSchema');
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require('uuid');
const { uploadToR2 } = require('../../uploads/r2Uploader');
const s3 = require('../../config/r2config');

const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_ENDPOINT = process.env.R2_ENDPOINT;

const PUBLIC_R2_BASE_URL = process.env.PUBLIC_R2_BASE_URL;

// ✅ Correct URL builder
const getR2FileUrl = (key) => `${PUBLIC_R2_BASE_URL}/${key}`;


// Multer memory storage for buffer uploads
const storage = multer({ storage: multer.memoryStorage() });
exports.upload = storage;

// ✅ Create Project
exports.createProjectDetails = async (req, res) => {
  try {
    const {
      projectName,
      projectOwner,
      projectContact,
      projectAddress,
      expectedStartDate,
      expectedEndDate,
      documentTypes
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


     const uploadedFiles = await uploadToR2(filesWithDocTypes, "project_master", "system_upload");
    const uploadedKeys = uploadedFiles.map(file => file.key);
    const projectBrouchers = uploadedKeys.join(',');

    const newProjectDetails = await ProjectMaster.create({
      projectName,
      projectOwner,
      projectContact,
      projectAddress,
      expectedStartDate,
      expectedEndDate,
      projectBrouchers
    });

    res.status(201).json(newProjectDetails);
  } catch (err) {
    if (err instanceof ValidationError) {
      const messages = err.errors.map((e) => e.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    res.status(500).json({ error: err.message });
  }
};

// ✅ Read Project Details
exports.getProjectDetails = async (req, res) => {
  try {
    const projectDetails = await ProjectMaster.findAll();

    const formatted = projectDetails.map(doc => ({
      ...doc.toJSON(),
      projectBrouchers: doc.projectBrouchers
        ? doc.projectBrouchers.split(',').map(getR2FileUrl)
        : []
    }));

    res.status(200).json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Update Project Details
exports.updateProjectsDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      projectName,
      projectOwner,
      projectContact,
      projectAddress,
      expectedStartDate,
      expectedEndDate,
      documentTypes,
      retainedFiles // JSON stringified array of keys
    } = req.body;

    const files = req.files || [];

    const project = await ProjectMaster.findOne({ where: { id } });
    if (!project) return res.status(404).json({ error: "Project not found" });

    // Parse retained file keys
    let retainedFileKeys = [];
    try {
      retainedFileKeys = typeof retainedFiles === 'string' ? JSON.parse(retainedFiles) : [];
    } catch (err) {
      return res.status(400).json({ error: 'Invalid retainedFiles format' });
    }

    const oldDocs = project.projectBrouchers ? project.projectBrouchers.split(',') : [];
    const filesToDelete = oldDocs.filter(key => !retainedFileKeys.includes(key));

    // Delete removed files from R2
    if (filesToDelete.length > 0) {
      await s3.deleteObjects({
        Bucket: R2_BUCKET_NAME,
        Delete: {
          Objects: filesToDelete.map(key => ({ Key: key })),
          Quiet: true
        }
      }).promise();
    }

    // Upload new files
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

      const uploadedFiles = await uploadToR2(filesWithDocTypes, "project_master_edit", "system_edit");
      newUploadedKeys = uploadedFiles.map(file => file.key); // 🔧 Extract keys only

    }

    const finalDocs = [...retainedFileKeys, ...newUploadedKeys];

    // Update project fields
    project.projectName = projectName;
    project.projectOwner = projectOwner;
    project.projectContact = projectContact;
    project.projectAddress = projectAddress;
    project.expectedStartDate = expectedStartDate;
    project.expectedEndDate = expectedEndDate;
    project.projectBrouchers = finalDocs.join(',');

    await project.save();
    res.status(200).json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Delete Project Details
exports.deleteProjectsDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await ProjectMaster.findOne({ where: { id } });
    if (!project) return res.status(404).json({ error: "Project not found" });

    const oldFiles = project.projectBrouchers
      ? project.projectBrouchers.split(',')
      : [];

    if (oldFiles.length > 0) {
      await s3.deleteObjects({
        Bucket: R2_BUCKET_NAME,
        Delete: {
          Objects: oldFiles.map(key => ({ Key: key })),
          Quiet: true
        }
      }).promise();
    }

    await ProjectMaster.destroy({ where: { id } });
    res.json({ message: "Project deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
