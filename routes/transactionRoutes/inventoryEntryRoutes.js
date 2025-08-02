const express = require('express');
const router = express.Router();
const projectFiter = require('../../middleware/projectId');

// ✅ Import controller and multer from controller file
const inventoryEntry = require('../../controllers/transactionControllers/inventoryEntry');
const upload = inventoryEntry.upload; 

// Create Inventory



router.post('/',  upload.any(),projectFiter, inventoryEntry.createInventoryEntry);
router.post('/import',  upload.any(),projectFiter, inventoryEntry.importInventoryFromExcel);


router.get('/', projectFiter, inventoryEntry.getInventoryDetails);

// For getting material master details (assuming it's a different endpoint)
router.get('/materialMaster', projectFiter, inventoryEntry.getMaterialMasterDetails);

// For getting unit type details
router.get('/unitTypes', projectFiter, inventoryEntry.getUnitTypeDetails);

// For getting vendor details
router.get('/vendor', projectFiter, inventoryEntry.getVendorDetails);

// ✅ Get Inventory by ID (user-specific)
router.get('/:id', projectFiter, inventoryEntry.getInventoryById);

// // ✅ Update Inventory (by ID)
// router.put('/:id', projectFiter, inventoryEntry.updateInventory);


// ✅ Update Inventory (uses correct multer config)
router.put('/:id', upload.any(), projectFiter, inventoryEntry.updateInventory);

// ✅ Delete Inventory (by ID)
router.delete('/:id', projectFiter, inventoryEntry.deleteInventory);

// Export the router
module.exports = router;
