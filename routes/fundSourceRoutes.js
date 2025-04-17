const express = require('express');
const router = express.Router();


const fundSourceController = require('../controllers/fundSourceController')

router.post('/', fundSourceController.createFundSource);
router.get('/', fundSourceController.getFundSources);
router.put('/:id', fundSourceController.updateFundSource);
router.delete('/:id', fundSourceController.deleteFundSource);

module.exports = router;
