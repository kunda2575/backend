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

    const uploadedFiles = await uploadToR2(projectName, filesWithDocTypes, "project_master", "project_upload");
    const fullUrls = uploadedFiles.map(file => (file.url || '').replace(/^public_url\s*=\s*/, '')); // Full URLs only
    const projectBrouchers = fullUrls.join(',');

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




// Converts Excel serial number to JS Date
function excelDateToJSDate(serial) {
  const excelEpoch = new Date(1899, 11, 30);
  const days = Math.floor(serial);
  return new Date(excelEpoch.getTime() + days * 86400000);
}

exports.importProjectData = async (req, res) => {
  try {
    const projects = req.body.projects;

    if (!Array.isArray(projects) || projects.length === 0) {
      return res.status(400).json({ error: "No project records provided." });
    }

    const requiredFields = ["projectName", "projectOwner", "projectContact", "projectAddress"];
    const errors = [];
    const cleanedProjects = [];

    projects.forEach((record, index) => {
      const rowErrors = [];

      // Validate required fields
      requiredFields.forEach(field => {
        if (!record[field] || String(record[field]).trim() === "") {
          rowErrors.push({
            row: index + 1,
            field,
            error: `${field} is required`
          });
        }
      });

      // Enhanced Date parsing helper
      const parseDateField = (value, label) => {
        if (!value) {
          rowErrors.push({
            row: index + 1,
            field: label,
            error: `${label} is required.`
          });
          return null;
        }

        let date = null;

        // Excel serial number check
        if (typeof value === 'number' || (!isNaN(value) && Number(value) > 10000)) {
          date = excelDateToJSDate(Number(value));
        } else if (typeof value === 'string') {
          // Check for DD-MM-YYYY or DD/MM/YYYY
          const dmyMatch = value.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
          if (dmyMatch) {
            const [, day, month, year] = dmyMatch;
            date = new Date(`${year}-${month}-${day}`);
          } else {
            // Fallback to native parsing
            const parsed = new Date(value);
            date = isNaN(parsed.getTime()) ? null : parsed;
          }
        }

        if (!date || isNaN(date.getTime())) {
          rowErrors.push({
            row: index + 1,
            field: label,
            error: `${label} must be a valid date. Received: ${value}`
          });
        }

        return date;
      };


      const expectedStartDate = parseDateField(record.expectedStartDate, "Expected Start Date");
      const expectedEndDate = parseDateField(record.expectedEndDate, "Expected End Date");

      // Optional: check if end date is after start date
      if (expectedStartDate && expectedEndDate && expectedEndDate < expectedStartDate) {
        rowErrors.push({
          row: index + 1,
          field: "Expected End Date",
          error: "Expected End Date must be after Expected Start Date."
        });
      }

      // Project address minimum length
      if (record.projectAddress && record.projectAddress.trim().length < 10) {
        rowErrors.push({
          row: index + 1,
          field: "projectAddress",
          error: "Project address must be at least 10 characters."
        });
      }

      if (rowErrors.length === 0) {
        cleanedProjects.push({
          projectName: String(record.projectName).trim(),
          projectOwner: String(record.projectOwner).trim(),
          projectContact: String(record.projectContact).trim(),
          projectAddress: String(record.projectAddress).trim(),
          expectedStartDate,
          expectedEndDate,
          projectBrouchers: record.projectBrouchers || null
        });
      } else {
        errors.push(...rowErrors);
      }
    });

    if (errors.length > 0) {
      return res.status(400).json({
        message: "Validation errors in uploaded project data.",
        errors
      });
    }

    const created = await ProjectMaster.bulkCreate(cleanedProjects, {
      validate: true,
      individualHooks: true
    });

    res.status(201).json({
      message: "Projects imported successfully.",
      count: created.length
    });

  } catch (err) {
    if (err instanceof ValidationError) {
      const messages = err.errors.map(e => e.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    console.error("Project import error:", err);
    res.status(500).json({ error: "Internal server error during project import." });
  }
};

// ✅ Read Project Details
exports.getProjectDetails = async (req, res) => {
  try {
    const projectDetails = await ProjectMaster.findAll();

    const formatted = projectDetails.map(doc => ({
      ...doc.toJSON(),
      projectBrouchers: doc.projectBrouchers
        ? doc.projectBrouchers.split(',').map(url => url.trim())
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
      retainedFiles
    } = req.body;

    const project = await ProjectMaster.findOne({ where: { id } });
    if (!project) return res.status(404).json({ error: "Project not found" });

    const files = req.files || [];

    // Parse retained file URLs or keys
    let retainedUrls = [];
    try {
      retainedUrls = typeof retainedFiles === 'string' ? JSON.parse(retainedFiles) : retainedFiles || [];
    } catch (err) {
      return res.status(400).json({ error: 'Invalid retainedFiles format' });
    }

    // Convert full URLs to keys for deletion
    const oldUrls = project.projectBrouchers ? project.projectBrouchers.split(',') : [];
    const urlsToDelete = oldUrls.filter(url => !retainedUrls.includes(url));
    const keysToDelete = urlsToDelete.map(url =>
      url.startsWith(PUBLIC_R2_BASE_URL)
        ? url.replace(`${PUBLIC_R2_BASE_URL}/`, '')
        : url
    );

    // Delete unretained files
    if (keysToDelete.length > 0) {
      await s3.deleteObjects({
        Bucket: R2_BUCKET_NAME,
        Delete: {
          Objects: keysToDelete.map(key => ({ Key: key })),
          Quiet: true
        }
      }).promise();
    }

    // Upload new files
    let newUploadedUrls = [];
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

      const uploadedFiles = await uploadToR2(projectName, filesWithDocTypes, "project_master_edit", "project_edit");
      newUploadedUrls = uploadedFiles.map(file => (file.url || '').replace(/^public_url\s*=\s*/, '')); // Use full URL
    }

    const allUrls = [...retainedUrls, ...newUploadedUrls];

    // Update fields
    project.projectName = projectName;
    project.projectOwner = projectOwner;
    project.projectContact = projectContact;
    project.projectAddress = projectAddress;
    project.expectedStartDate = expectedStartDate;
    project.expectedEndDate = expectedEndDate;
    project.projectBrouchers = allUrls.join(',');

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
