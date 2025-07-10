const express = require("express");
const router = express.Router();

const projectController = require('../../controllers/updateControllers/projectMasterController');
const verifyToken = require("../../middleware/verfiyToken");

// File Upload Middleware (Multer)
const upload = projectController.upload;

// ✅ Create project with file upload
router.post(
  "/",
  verifyToken,
  upload.any(), // Field name should match form
  projectController.createProjectDetails
);

// ✅ Get all projects
router.get("/", verifyToken, projectController.getProjectDetails);

// ✅ Update project with file upload
router.put(
  "/:id",
  verifyToken,
  upload.any(), // Allow file updates
  projectController.updateProjectsDetails
);

// ✅ Delete project
router.delete("/:id", verifyToken, projectController.deleteProjectsDetails);

module.exports = router;
