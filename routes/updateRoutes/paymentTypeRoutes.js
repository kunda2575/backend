const express = require('express');
const router = express.Router();

const paymentTypeController = require('../../controllers/updateControllers/paymentTypeController');
const verifyToken = require('../../middleware/verfiyToken');

router.post('/', verifyToken,paymentTypeController.createPaymentType);
router.post('/import', verifyToken,paymentTypeController.importPaymentTypeData);
router.get('/', verifyToken,paymentTypeController.getPaymentTypes);
router.put('/:id', verifyToken,paymentTypeController.updatePaymentType);
router.delete('/:id', verifyToken,paymentTypeController.deletePaymentType);

module.exports = router;
