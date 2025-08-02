const express = require('express');
const router = express.Router();
const projectFiter = require('../../middleware/projectId');

const expenditure = require('../../controllers/transactionControllers/expenditure');

const multer = require("multer");
const storage = multer.memoryStorage(); // ✅ Fix: use memory storage
const upload = multer({ storage });

router.post(
  '/',
  upload.fields([
    { name: 'payment_reference_files', maxCount: 5 },
    { name: 'payment_evidence_files', maxCount: 5 }
  ]),
  projectFiter,
  expenditure.createExpenditure
);

// ... rest unchanged


router.post(
  '/import',
  upload.fields([
    { name: 'payment_reference_files', maxCount: 5 },
    { name: 'payment_evidence_files', maxCount: 5 }
  ]),
  projectFiter,
  expenditure.importExpenditureFromExcel
);

// Get expenditure master details
router.get('/', projectFiter, expenditure.getExpenditureDetails);

// router.get('/', expenditureController.getAllExpenditures);


// Get vendor master details
router.get('/vendor',projectFiter,  expenditure.getVendorDetails);

// Get expense master details
router.get('/expense', projectFiter, expenditure.getExpenseDetails);

// Get payment mode master details
router.get('/paymentMode', projectFiter, expenditure.getPaymentModeDetails);

// Get payment bank master details
router.get('/paymentBank', projectFiter, expenditure.getPaymentBankDetails);



// Get expenditure details with filtering and pagination
router.get('/:id', projectFiter, expenditure.getExpenditureById);

router.put(
  '/:id',
  upload.fields([
    { name: 'payment_reference_files', maxCount: 5 },
    { name: 'payment_evidence_files', maxCount: 5 }
  ]),
  projectFiter,
  expenditure.updateExpenditure
);

// Delete Expenditure (by ID)
router.delete('/:id', projectFiter, expenditure.deleteExpenditure);

// Export the router
module.exports = router;
