const express = require('express');
const router = express.Router();
const projectFiter = require('../../middleware/projectId');

// Import controller functions
const stockAvailability = require('../../controllers/transactionControllers/stockAvailability');

// Create Material
router.post('/', projectFiter, stockAvailability.createMaterial);
router.post('/import', projectFiter, stockAvailability.importStockAvailabilityFromExcel);

// Get Material Details with filtering and pagination
router.get('/', projectFiter, stockAvailability.getMaterialDetails);

// Get Material Master Details (user-specific)
router.get('/materialMaster', projectFiter, stockAvailability.getMaterialMasterDetails);

// Get Unit Type Details (user-specific)
router.get('/unitTypes', projectFiter, stockAvailability.getUnitTypeDetails);

// ✅ Get Material by ID (user-specific)
router.get('/:id', projectFiter, stockAvailability.getMaterialById);

// ✅ Update Material (by ID)
router.put('/:id', projectFiter, stockAvailability.updateMaterial);

// ✅ Delete Material (by ID)
router.delete('/:id', projectFiter, stockAvailability.deleteMaterial);

// Export the router
module.exports = router;
