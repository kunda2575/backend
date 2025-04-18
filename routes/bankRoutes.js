const express = require('express');
const router = express.Router();
const bankMasterController = require('../controllers/bankMasterController')
const verifyToken = require('../middleware/verfiyToken')

router.post('/',verifyToken, bankMasterController.createBankDetails);
router.get('/', verifyToken,bankMasterController.getBankDetails);
router.put('/:id', verifyToken,bankMasterController.updateBankDetails);
router.delete('/:id',verifyToken, bankMasterController.deleteBankDetails);

module.exports = router;
