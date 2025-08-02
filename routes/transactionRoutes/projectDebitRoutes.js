const express = require('express');
const router = express.Router();
const projectFiter = require('../../middleware/projectId');

// Import controller functions
const projectDebit = require('../../controllers/transactionControllers/projectdebit');

// Create projectDebit
router.post('/', projectFiter, projectDebit.createProjectDebit);
router.post('/import', projectFiter, projectDebit.importProjectDebitFromExcel);

// Get projectDebit master details
router.get('/', projectFiter, projectDebit.getProjectDebitDetails);



// Get vendor master details
router.get('/vendor',projectFiter,  projectDebit.getVendorDetails);


// Get payment mode master details
router.get('/paymentMode', projectFiter, projectDebit.getPaymentModeDetails);

// Get payment bank master details
router.get('/payTo', projectFiter, projectDebit.getPayTo);


// Get payment bank master details
router.get('/paymentBank', projectFiter, projectDebit.getPaymentBankDetails);



// Get projectDebit details with filtering and pagination
router.get('/:id', projectFiter, projectDebit.getProjectDebitById);


// Update Expenditure (by ID)
router.put('/:id', projectFiter, projectDebit.updateProjectDebit);

// Delete Expenditure (by ID)
router.delete('/:id', projectFiter, projectDebit.deleteProjectDebit);

// Export the router
module.exports = router;
