const express = require('express');
const router = express.Router();

const fundSourceController = require('../../controllers/updateControllers/fundSourceController');
const verifyToken = require('../../middleware/verfiyToken');

router.post('/', verifyToken,fundSourceController.createFundSource);
router.post('/import', verifyToken,fundSourceController.importFundSourceData);
router.get('/',verifyToken, fundSourceController.getFundSources);
router.put('/:id', verifyToken,fundSourceController.updateFundSource);
router.delete('/:id',verifyToken, fundSourceController.deleteFundSource);

module.exports = router;
