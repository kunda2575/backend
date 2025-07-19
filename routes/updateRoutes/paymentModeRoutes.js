const express = require('express');
const router = express.Router();

const paymentModeController = require('../../controllers/updateControllers/paymentModeMasterController');
const verifyToken = require('../../middleware/verfiyToken');

router.post('/', verifyToken,paymentModeController.createPaymentMode);
router.post('/import', verifyToken,paymentModeController.importPaymentModeData);
router.get('/', verifyToken,paymentModeController.getPaymentModes);
router.put('/:id', verifyToken,paymentModeController.updatePaymentMode);
router.delete('/:id', verifyToken,paymentModeController.deletePaymentMode);

module.exports = router;
