const express = require('express');
const router = express.Router();
const projectFiter = require('../../middleware/projectId');

// Import controller functions
const materialIssue  = require('../../controllers/transactionControllers/materialIssue');

// Create Material
router.post('/', projectFiter, materialIssue.createMaterialIssue);
router.post('/import', projectFiter, materialIssue.importMaterialIssuesFromExcel);

// Get Material Details with filtering and pagination
router.get('/', projectFiter, materialIssue.getMaterialIssuesDetails);

// Get Material Master Details (user-specific)
router.get('/materialMaster', projectFiter, materialIssue.getMaterialMasterDetails);

// Get Unit Type Details (user-specific)
router.get('/unitTypes', projectFiter, materialIssue.getUnitTypeDetails);

// ✅ Get Material by ID (user-specific)
router.get('/:id', projectFiter, materialIssue.getMaterialIssueById);

// ✅ Update Material (by ID)
router.put('/:id', projectFiter, materialIssue.updateMaterialIssue);

// ✅ Delete Material (by ID)
router.delete('/:id', projectFiter, materialIssue.deleteMaterialIssue);

// Export the router
module.exports = router;
