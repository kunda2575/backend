const express = require('express');
const router = express.Router();
const bankMasterController = require('../../controllers/updateControllers/bankMasterController')
const projectFilter = require('../../middleware/projectId')

router.post('/',projectFilter, bankMasterController.createBankDetails);

router.post('/import',projectFilter, bankMasterController.importBankFromExcel);
router.get('/', projectFilter,bankMasterController.getBankDetails);
router.put('/:id', projectFilter,bankMasterController.updateBankDetails);
router.delete('/:id',projectFilter, bankMasterController.deleteBankDetails);

module.exports = router;

