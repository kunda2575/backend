const express = require("express");
const router = express.Router();

const projectController = require('../../controllers/updateControllers/projectMasterController');
const projectFilter = require("../../middleware/projectId");

// File Upload Middleware (Multer)
const upload = projectController.upload;

// ✅ Create project with file upload
router.post(
  "/",
  projectFilter,
  upload.any(), // Field name should match form
  projectController.createProjectDetails
);
router.post(
  "/import",
  projectFilter,
  upload.any(), // Field name should match form
  projectController.importProjectData
);

// ✅ Get all projects
router.get("/", projectFilter, projectController.getProjectDetails);

// ✅ Update project with file upload
router.put(
  "/:id",
  projectFilter,
  upload.any(), // Allow file updates
  projectController.updateProjectsDetails
);

// ✅ Delete project
router.delete("/:id", projectFilter, projectController.deleteProjectsDetails);

module.exports = router;
