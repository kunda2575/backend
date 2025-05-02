const express = require('express');
const router = express.Router();
const verifyToken = require('../../middleware/verfiyToken');

// Import controller functions
const inventoryEntry = require('../../controllers/transactionControllers/inventoryEntry');

// Create Inventory
router.post('/', verifyToken, inventoryEntry.createInventory);

// Get Inventory Details with filtering and pagination
router.get('/', verifyToken, inventoryEntry.getInventaryDetails);

// For getting material master details (assuming it's a different endpoint)
router.get('/materialMaster', verifyToken, inventoryEntry.getMaterialMasterDetails);

// For getting unit type details
router.get('/unitTypes', verifyToken, inventoryEntry.getUnitTypeDetails);
// For getting vendor details
router.get('/vendor', verifyToken, inventoryEntry.getVendorDetails);

// Export the router
module.exports = router;
