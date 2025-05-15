const express = require('express');
const router = express.Router();
const verifyToken = require('../../middleware/verfiyToken');

// Import controller functions
const expenditure = require('../../controllers/transactionControllers/expenditure');

// Create expenditure
router.post('/', verifyToken, expenditure.createExpenditure);

// Get expenditure master details
router.get('/', verifyToken, expenditure.getExpenditureDetails);

// router.get('/', expenditureController.getAllExpenditures);


// Get vendor master details
router.get('/vendor',verifyToken,  expenditure.getVendorDetails);

// Get expense master details
router.get('/expense', verifyToken, expenditure.getExpenseDetails);

// Get payment mode master details
router.get('/paymentMode', verifyToken, expenditure.getPaymentModeDetails);

// Get payment bank master details
router.get('/paymentBank', verifyToken, expenditure.getPaymentBankDetails);



// Get expenditure details with filtering and pagination
router.get('/:id', verifyToken, expenditure.getExpenditureById);


// Update Expenditure (by ID)
router.put('/:id', verifyToken, expenditure.updateExpenditure);

// Delete Expenditure (by ID)
router.delete('/:id', verifyToken, expenditure.deleteExpenditure);

// Export the router
module.exports = router;
