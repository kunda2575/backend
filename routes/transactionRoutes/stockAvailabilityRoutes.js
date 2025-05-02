const express = require('express');
const router = express.Router();
const verifyToken = require('../../middleware/verfiyToken');

// Import controller functions
const stockAvailability = require('../../controllers/transactionControllers/stockAvailability');

// Create Material
router.post('/', verifyToken, stockAvailability.createMaterial);

// Get Material Details with filtering and pagination
router.get('/', verifyToken, stockAvailability.getMaterialDetails);

// For getting material master details (assuming it's a different endpoint)
router.get('/materialMaster', verifyToken, stockAvailability.getMaterialMasterDetails);

// For getting unit type details
router.get('/unitTypes', verifyToken, stockAvailability.getUnitTypeDetails);

// Export the router
module.exports = router;
