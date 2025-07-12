const express = require('express');
const router = express.Router();
const verifyToken = require('../../middleware/verfiyToken');

// ✅ Import controller and multer from controller file
const inventoryEntry = require('../../controllers/transactionControllers/inventoryEntry');
const upload = inventoryEntry.upload; 

// Create Inventory



router.post('/',  upload.any(),verifyToken, inventoryEntry.createInventoryEntry);
router.post('/import',  upload.any(),verifyToken, inventoryEntry.importInventoryFromExcel);


router.get('/', verifyToken, inventoryEntry.getInventoryDetails);

// For getting material master details (assuming it's a different endpoint)
router.get('/materialMaster', verifyToken, inventoryEntry.getMaterialMasterDetails);

// For getting unit type details
router.get('/unitTypes', verifyToken, inventoryEntry.getUnitTypeDetails);

// For getting vendor details
router.get('/vendor', verifyToken, inventoryEntry.getVendorDetails);

// ✅ Get Inventory by ID (user-specific)
router.get('/:id', verifyToken, inventoryEntry.getInventoryById);

// // ✅ Update Inventory (by ID)
// router.put('/:id', verifyToken, inventoryEntry.updateInventory);


// ✅ Update Inventory (uses correct multer config)
router.put('/:id', upload.any(), verifyToken, inventoryEntry.updateInventory);

// ✅ Delete Inventory (by ID)
router.delete('/:id', verifyToken, inventoryEntry.deleteInventory);

// Export the router
module.exports = router;
