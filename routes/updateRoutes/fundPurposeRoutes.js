const express = require('express');
const router = express.Router();

const fundPurposeController = require('../../controllers/updateControllers/fundPurposeController');
const projectFilter = require('../../middleware/projectId');

router.post('/', projectFilter,fundPurposeController.createFundPurpose);
router.post('/import', projectFilter,fundPurposeController.importFundPurposeData);
router.get('/', projectFilter,fundPurposeController.getFundPurposes);
router.put('/:id',projectFilter, fundPurposeController.updateFundPurpose);
router.delete('/:id', projectFilter,fundPurposeController.deleteFundPurpose);

module.exports = router;
