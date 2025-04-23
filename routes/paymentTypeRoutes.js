const express = require('express');
const router = express.Router();

const paymentTypeController = require('../controllers/paymentTypeController');
const verifyToken = require('../middleware/verfiyToken');

router.post('/', verifyToken,paymentTypeController.createPaymentType);
router.get('/', verifyToken,paymentTypeController.getPaymentTypes);
router.put('/:id', verifyToken,paymentTypeController.updatePaymentType);
router.delete('/:id', verifyToken,paymentTypeController.deletePaymentType);

module.exports = router;
