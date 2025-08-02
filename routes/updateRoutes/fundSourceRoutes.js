const express = require('express');
const router = express.Router();

const fundSourceController = require('../../controllers/updateControllers/fundSourceController');
const projectFilter = require('../../middleware/projectId');

router.post('/', projectFilter,fundSourceController.createFundSource);
router.post('/import', projectFilter,fundSourceController.importFundSourceData);
router.get('/',projectFilter, fundSourceController.getFundSources);
router.put('/:id', projectFilter,fundSourceController.updateFundSource);
router.delete('/:id',projectFilter, fundSourceController.deleteFundSource);

module.exports = router;
