const express = require('express');
const router = express.Router();
const verifyToken = require('../../middleware/verfiyToken');

// Import controller functions
const stockAvailability = require('../../controllers/transactionControllers/stockAvailability');

// Create Material
router.post('/', verifyToken, stockAvailability.createMaterial);
router.post('/import', verifyToken, stockAvailability.importStockAvailabilityFromExcel);

// Get Material Details with filtering and pagination
router.get('/', verifyToken, stockAvailability.getMaterialDetails);

// Get Material Master Details (user-specific)
router.get('/materialMaster', verifyToken, stockAvailability.getMaterialMasterDetails);

// Get Unit Type Details (user-specific)
router.get('/unitTypes', verifyToken, stockAvailability.getUnitTypeDetails);

// ✅ Get Material by ID (user-specific)
router.get('/:id', verifyToken, stockAvailability.getMaterialById);

// ✅ Update Material (by ID)
router.put('/:id', verifyToken, stockAvailability.updateMaterial);

// ✅ Delete Material (by ID)
router.delete('/:id', verifyToken, stockAvailability.deleteMaterial);

// Export the router
module.exports = router;
