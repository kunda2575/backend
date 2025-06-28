const express = require('express');
const router = express.Router();
const customerController = require('../../controllers/updateControllers/customerMasterController');
const { uploadToR2 } = require('../../uploads/r2Uploader');
const verifyToken = require('../../middleware/verfiyToken');
const multer = require('multer');
const upload = multer(); // stores files in memory
// 📌 Create customer with file uploadToR2
router.post(
  '/',
  verifyToken,
  upload.array('documents'),
  customerController.createCustomerDetails
);

// 📌 Read all customers
router.get(
  '/',
  verifyToken,
  customerController.getCustomerDetails
);

// 📌 Update customer (with optional file replacement)
router.put(
  '/:customerId',
  verifyToken,
  upload.array('documents'),
  customerController.updateCustomersDetails
);

// 📌 Delete customer
router.delete(
  '/:customerId',
  verifyToken,
  customerController.deleteCustomersDetails
);

module.exports = router;
