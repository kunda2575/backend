const express = require('express');
const router = express.Router();
const verifyToken = require('../../middleware/verfiyToken');
const multer = require('multer');

const upload = multer(); // stores files in memory

// Import controller functions
const customerPayment = require('../../controllers/transactionControllers/customerPayments');

// Create customerPayment
router.post('/', verifyToken,upload.any(), customerPayment.createcustomerPayments);
router.post('/import', verifyToken,upload.any(), customerPayment.importCustomerFromExcel);

// Get customerPayment master details
router.get('/', verifyToken, customerPayment.getcustomerPaymentsDetails);



// Get vendor master details
router.get('/paymentType',verifyToken,  customerPayment.getpaymentTypeDetails);


// Get payment mode master details
router.get('/paymentMode', verifyToken, customerPayment.getPaymentModeDetails);

// Get payment bank master details
router.get('/verifiedBy', verifyToken, customerPayment.getVerifiedByDetails);


// Get payment bank master details
router.get('/fundingBank', verifyToken, customerPayment.getfundingBankDetails);


router.get('/customer', verifyToken, customerPayment.getCustomerDetails);



// Get customerPayment details with filtering and pagination
router.get('/:id', verifyToken, customerPayment.getcustomerPaymentsById);



// Update Expenditure (by ID)
router.put('/:id', verifyToken, upload.any(),customerPayment.updatecustomerPayments);

// Delete Expenditure (by ID)
router.delete('/:id', verifyToken, customerPayment.deletecustomerPayments);

// Export the router
module.exports = router;
