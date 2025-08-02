const express = require('express');
const router = express.Router();

const vendorMaster = require('../../controllers/updateControllers/vendorMasterController');
const projectFilter = require('../../middleware/projectId');

router.post('/', projectFilter,vendorMaster.createVendor);
router.post('/import', projectFilter,vendorMaster.importVendorsExcelData);
router.get('/', projectFilter,vendorMaster.getVendors);
router.put('/:id', projectFilter,vendorMaster.updateVendor);
router.delete('/:id', projectFilter,vendorMaster.deleteVendor);

module.exports = router;
