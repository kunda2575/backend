const express = require('express');
const router = express.Router();
const verifyToken = require('../../middleware/verfiyToken');

// Import controller functions
const projectDebit = require('../../controllers/transactionControllers/projectdebit');

// Create projectDebit
router.post('/', verifyToken, projectDebit.createProjectDebit);

// Get projectDebit master details
router.get('/', verifyToken, projectDebit.getProjectDebitDetails);

// router.get('/', projectDebitController.getAllExpenditures);


// Get vendor master details
router.get('/vendor',verifyToken,  projectDebit.getVendorDetails);

// Get expense master details
router.get('/expense', verifyToken, projectDebit.getExpenseDetails);

// Get payment mode master details
router.get('/paymentMode', verifyToken, projectDebit.getPaymentModeDetails);

// Get payment bank master details
router.get('/payTo', verifyToken, projectDebit.getPayTo);


// Get payment bank master details
router.get('/paymentBank', verifyToken, projectDebit.getPaymentBankDetails);



// Get projectDebit details with filtering and pagination
router.get('/:id', verifyToken, projectDebit.getProjectDebitById);


// Update Expenditure (by ID)
router.put('/:id', verifyToken, projectDebit.updateProjectDebit);

// Delete Expenditure (by ID)
router.delete('/:id', verifyToken, projectDebit.deleteProjectDebit);

// Export the router
module.exports = router;
