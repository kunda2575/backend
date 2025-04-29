const express = require('express');
const router = express.Router();

const fundPurposeController = require('../../controllers/updateControllers/fundPurposeController');
const verifyToken = require('../../middleware/verfiyToken');

router.post('/', verifyToken,fundPurposeController.createFundPurpose);
router.get('/', verifyToken,fundPurposeController.getFundPurposes);
router.put('/:id',verifyToken, fundPurposeController.updateFundPurpose);
router.delete('/:id', verifyToken,fundPurposeController.deleteFundPurpose);

module.exports = router;
