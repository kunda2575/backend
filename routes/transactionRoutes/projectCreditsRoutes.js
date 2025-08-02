const express = require('express');
const router = express.Router();
const projectFiter = require('../../middleware/projectId');

// Import controller functions
const projectCredits = require('../../controllers/transactionControllers/projectCredits');

// Create projectCredits
router.post('/', projectFiter, projectCredits.createProjectCredits);

router.post('/import', projectFiter, projectCredits.importProjectCreditFromExcel);

// Get projectCredits master details
router.get('/', projectFiter, projectCredits.getProjectCreditsDetails);


// Get vendor master details
router.get('/source',projectFiter,  projectCredits.getSourceDetails);

// Get purpose master details
router.get('/purpose', projectFiter, projectCredits.getPurposeDetails);

// Get deposite bank master details
router.get('/depositeBank', projectFiter, projectCredits.getDepositeBankDetails);

// Get payment mode master details
router.get('/paymentMode', projectFiter, projectCredits.getPaymentModeDetails);


// Get projectCredits details with filtering and pagination
router.get('/:id', projectFiter, projectCredits.getProjectCreditsById);


// Update ProjectCredits (by ID)
router.put('/:id', projectFiter, projectCredits.updateProjectCredits);

// Delete ProjectCredits (by ID)
router.delete('/:id', projectFiter, projectCredits.deleteProjectCredits);

// Export the router
module.exports = router;
