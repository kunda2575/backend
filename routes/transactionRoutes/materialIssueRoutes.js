const express = require('express');
const router = express.Router();
const verifyToken = require('../../middleware/verfiyToken');

// Import controller functions
const materialIssue  = require('../../controllers/transactionControllers/materialIssue');

// Create Material
router.post('/', verifyToken, materialIssue.createMaterialIssue);

// Get Material Details with filtering and pagination
router.get('/', verifyToken, materialIssue.getMaterialIssueDetails);

// Get Material Master Details (user-specific)
router.get('/materialMaster', verifyToken, materialIssue.getMaterialMasterDetails);

// Get Unit Type Details (user-specific)
router.get('/unitTypes', verifyToken, materialIssue.getUnitTypeDetails);

// ✅ Get Material by ID (user-specific)
router.get('/:id', verifyToken, materialIssue.getMaterialIssueById);

// ✅ Update Material (by ID)
router.put('/:id', verifyToken, materialIssue.updateMaterialIssue);

// ✅ Delete Material (by ID)
router.delete('/:id', verifyToken, materialIssue.deleteMaterialIssue);

// Export the router
module.exports = router;
