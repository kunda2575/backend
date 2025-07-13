const express = require('express');
const router = express.Router();
const verifyToken = require('../../middleware/verfiyToken');

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
  verifyToken,
  expenditure.createExpenditure
);

// ... rest unchanged


router.post(
  '/import',
  upload.fields([
    { name: 'payment_reference_files', maxCount: 5 },
    { name: 'payment_evidence_files', maxCount: 5 }
  ]),
  verifyToken,
  expenditure.importExpenditureFromExcel
);

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

router.put(
  '/:id',
  upload.fields([
    { name: 'payment_reference_files', maxCount: 5 },
    { name: 'payment_evidence_files', maxCount: 5 }
  ]),
  verifyToken,
  expenditure.updateExpenditure
);

// Delete Expenditure (by ID)
router.delete('/:id', verifyToken, expenditure.deleteExpenditure);

// Export the router
module.exports = router;
