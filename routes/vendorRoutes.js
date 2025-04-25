const express = require('express');
const router = express.Router();

const vendorMaster = require('../controllers/vendorMasterController');
const verifyToken = require('../middleware/verfiyToken');

router.post('/', verifyToken,vendorMaster.createVendor);
router.get('/', verifyToken,vendorMaster.getVendors);
router.put('/:id', verifyToken,vendorMaster.updateVendor);
router.delete('/:id', verifyToken,vendorMaster.deleteVendor);

module.exports = router;
