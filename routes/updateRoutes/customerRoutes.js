const express = require('express');
const router = express.Router();
const customerController = require('../../controllers/updateControllers/customerMasterController');
const { uploadToR2 } = require('../../uploads/r2Uploader');
const projectFilter = require('../../middleware/projectId');
const multer = require('multer');

const upload = multer(); // stores files in memory

// ✅ Create customer with file upload
// router.post('/', projectFilter, upload.array('documents'), customerController.createCustomerDetails);
router.post('/', projectFilter, upload.any(), customerController.createCustomerDetails);

router.post('/import', projectFilter, upload.any(), customerController.importCustomerFromExcel);


// ✅ Read all customers
router.get('/', projectFilter, customerController.getCustomerDetails);

// ✅ Read leads
router.get('/lead', customerController.getLeadDetails);

// ✅ Update customer with file re-upload (optional)
router.put('/:customerId', projectFilter, upload.any(), customerController.updateCustomersDetails);

// ✅ Delete customer
router.delete('/:customerId', projectFilter, customerController.deleteCustomersDetails);
router.get('/:customerId', projectFilter, customerController.getCustomerById);

module.exports = router;
