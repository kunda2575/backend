const express = require('express');
const router = express.Router();
const projectFiter = require('../../middleware/projectId');
const multer = require('multer');

const upload = multer(); // stores files in memory

// Import controller functions
const customerPayment = require('../../controllers/transactionControllers/customerPayments');

// Create customerPayment
router.post('/', projectFiter,upload.any(), customerPayment.createcustomerPayments);
router.post('/import', projectFiter,upload.any(), customerPayment.importCustomerFromExcel);

// Get customerPayment master details
router.get('/', projectFiter, customerPayment.getcustomerPaymentsDetails);



// Get vendor master details
router.get('/paymentType',projectFiter,  customerPayment.getpaymentTypeDetails);


// Get payment mode master details
router.get('/paymentMode', projectFiter, customerPayment.getPaymentModeDetails);

// Get payment bank master details
router.get('/verifiedBy', projectFiter, customerPayment.getVerifiedByDetails);


// Get payment bank master details
router.get('/fundingBank', projectFiter, customerPayment.getfundingBankDetails);


router.get('/customer', projectFiter, customerPayment.getCustomerDetails);



// Get customerPayment details with filtering and pagination
router.get('/:id', projectFiter, customerPayment.getcustomerPaymentsById);



// Update Expenditure (by ID)
router.put('/:id', projectFiter, upload.any(),customerPayment.updatecustomerPayments);

// Delete Expenditure (by ID)
router.delete('/:id', projectFiter, customerPayment.deletecustomerPayments);

// Export the router
module.exports = router;
