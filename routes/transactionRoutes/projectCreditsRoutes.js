const express = require('express');
const router = express.Router();
const verifyToken = require('../../middleware/verfiyToken');

// Import controller functions
const projectCredits = require('../../controllers/transactionControllers/projectCredits');

// Create projectCredits
router.post('/', verifyToken, projectCredits.createProjectCredits);

// Get projectCredits master details
router.get('/', verifyToken, projectCredits.getProjectCreditsDetails);


// Get vendor master details
router.get('/source',verifyToken,  projectCredits.getSourceDetails);

// Get expense master details
router.get('/purpose', verifyToken, projectCredits.getPurposeDetails);

// Get payment mode master details
router.get('/paymentMode', verifyToken, projectCredits.getPaymentModeDetails);


// Get projectCredits details with filtering and pagination
router.get('/:id', verifyToken, projectCredits.getProjectCreditsById);


// Update ProjectCredits (by ID)
router.put('/:id', verifyToken, projectCredits.updateProjectCredits);

// Delete ProjectCredits (by ID)
router.delete('/:id', verifyToken, projectCredits.deleteProjectCredits);

// Export the router
module.exports = router;
