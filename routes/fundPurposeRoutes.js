const express = require('express');
const router = express.Router();


const fundPurposeController = require('../controllers/fundPurposeController')

router.post('/', fundPurposeController.createFundPurpose);
router.get('/', fundPurposeController.getFundPurposes);
router.put('/:id', fundPurposeController.updateFundPurpose);
router.delete('/:id', fundPurposeController.deleteFundPurpose);

module.exports = router;
