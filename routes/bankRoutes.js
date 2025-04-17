const express = require('express');
const router = express.Router();
const bankMasterController = require('../controllers/bankMasterController')

router.post('/', bankMasterController.createBankDetails);
router.get('/', bankMasterController.getBankDetails);
router.put('/:id', bankMasterController.updateBankDetails);
router.delete('/:id', bankMasterController.deleteBankDetails);

module.exports = router;
