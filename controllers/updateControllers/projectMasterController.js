const { ValidationError } = require('sequelize');
const ProjectMaster = require('../../models/updateModels/projectMasterSchema');
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require('uuid');

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../../uploads");

    // Create directory if not exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
     const ext = path.extname(file.originalname);
     const uniqueName = `${file.fieldname}-${uuidv4()}${ext}`; // ✅ use uuid
     cb(null, uniqueName);
   },
});

// Export multer upload middleware
exports.upload = multer({ storage });

// ✅ Create Project
exports.createProjectDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      projectName,
      projectOwner,
      projectContact,
      projectAddress,
      projectStartDate,
      projectEndDate
    } = req.body;

    const files = req.files || [];
    const projectBrouchers = files.map(file => file.filename).join(',');

    const newProjectDetails = await ProjectMaster.create({
    
      projectName,
      projectOwner,
      projectContact,
      projectAddress,
      projectBrouchers,
      projectStartDate,
      projectEndDate
    });

    res.status(201).json(newProjectDetails);
  } catch (err) {
     if (err instanceof ValidationError) {
      const messages = err.errors.map((e) => e.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
   
  }
};

// ✅ Read Project Details
exports.getProjectDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const projectDetails = await ProjectMaster.findAll();

    const updatedProperties = projectDetails.map(property => ({
      ...property.toJSON(),
      projectBroucher: property.projectBrouchers
        ? property.projectBrouchers.split(",").map(img => `http://localhost:2026/uploads/${img}`)
        : []
    }));

    res.status(200).json(updatedProperties);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Update Project Details
exports.updateProjectsDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const {
      projectName,
      projectOwner,
      projectContact,
      projectAddress,
      projectStartDate,
      projectEndDate
    } = req.body;

    const projectDetails = await ProjectMaster.findOne({ where: { id } });
    if (!projectDetails) return res.status(404).json({ error: "Project not found" });

    const files = req.files || [];
    let projectBrouchers;

    if (files.length > 0) {
      // Delete old files
      const oldFiles = projectDetails.projectBrouchers
        ? projectDetails.projectBrouchers.split(',')
        : [];

      oldFiles.forEach(file => {
        const filePath = path.join(__dirname, "../../uploads", file);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });

      // New uploaded files
      projectBrouchers = files.map(file => file.filename).join(',');
    } else {
      // Keep old
      projectBrouchers = projectDetails.projectBrouchers;
    }

    // Update fields
    projectDetails.projectName = projectName;
    projectDetails.projectOwner = projectOwner;
    projectDetails.projectContact = projectContact;
    projectDetails.projectAddress = projectAddress;
    projectDetails.projectBrouchers = projectBrouchers;
    projectDetails.projectStartDate = projectStartDate;
    projectDetails.projectEndDate = projectEndDate;

    await projectDetails.save();
    res.status(200).json(projectDetails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Delete Project Details
exports.deleteProjectsDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    // Find the project before deleting
    const project = await ProjectMaster.findOne({ where: { id } });
    if (!project) return res.status(404).json({ error: "Project not found" });

    // Delete associated files
    const oldFiles = project.projectBrouchers
      ? project.projectBrouchers.split(',')
      : [];

    oldFiles.forEach(file => {
      const filePath = path.join(__dirname, "../../uploads", file);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });

    await ProjectMaster.destroy({ where: { id } });
    res.json({ message: "Project deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
