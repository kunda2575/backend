const express = require('express');
const router = express.Router();

const vendorMaster = require('../controllers/vendorMasterController');
const verifyToken = require('../middleware/verfiyToken');

router.post('/', verifyToken,vendorMaster.createVendor);
router.get('/', verifyToken,vendorMaster.getVendors);
router.put('/:vendorId', verifyToken,vendorMaster.updateVendor);
router.delete('/:vendorId', verifyToken,vendorMaster.deleteVendor);

module.exports = router;
