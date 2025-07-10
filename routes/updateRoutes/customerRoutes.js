const express = require('express');
const router = express.Router();
const customerController = require('../../controllers/updateControllers/customerMasterController');
const { uploadToR2 } = require('../../uploads/r2Uploader');
const verifyToken = require('../../middleware/verfiyToken');
const multer = require('multer');

const upload = multer(); // stores files in memory

// ✅ Create customer with file upload
// router.post('/', verifyToken, upload.array('documents'), customerController.createCustomerDetails);
router.post('/', verifyToken, upload.any(), customerController.createCustomerDetails);


// ✅ Read all customers
router.get('/', verifyToken, customerController.getCustomerDetails);

// ✅ Read leads
router.get('/lead', customerController.getLeadDetails);

// ✅ Update customer with file re-upload (optional)
router.put('/:customerId', verifyToken, upload.any(), customerController.updateCustomersDetails);

// ✅ Delete customer
router.delete('/:customerId', verifyToken, customerController.deleteCustomersDetails);
router.get('/:customerId', verifyToken, customerController.getCustomerById);

module.exports = router;
