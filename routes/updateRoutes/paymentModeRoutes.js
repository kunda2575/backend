const express = require('express');
const router = express.Router();

const paymentModeController = require('../../controllers/updateControllers/paymentModeMasterController');
const verifyToken = require('../../middleware/verfiyToken');
const projectFilter = require('../../middleware/projectId');

router.post('/', projectFilter,paymentModeController.createPaymentMode);
router.post('/import', projectFilter,paymentModeController.importPaymentModeData);
router.get('/', projectFilter,paymentModeController.getPaymentModes);
router.put('/:id', projectFilter,paymentModeController.updatePaymentMode);
router.delete('/:id', projectFilter,paymentModeController.deletePaymentMode);

module.exports = router;
