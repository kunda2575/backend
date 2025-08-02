const express = require('express');
const router = express.Router();

const paymentTypeController = require('../../controllers/updateControllers/paymentTypeController');
// const verifyToken = require('../../middleware/verfiyToken');
const projectFilter = require('../../middleware/projectId');

router.post('/', projectFilter,paymentTypeController.createPaymentType);
router.post('/import', projectFilter,paymentTypeController.importPaymentTypeData);
router.get('/', projectFilter,paymentTypeController.getPaymentTypes);
router.put('/:id', projectFilter,paymentTypeController.updatePaymentType);
router.delete('/:id', projectFilter,paymentTypeController.deletePaymentType);

module.exports = router;
