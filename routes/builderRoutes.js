const express = require('express');
const router = express.Router();


const builderMasterController = require('../controllers/builderMasterController')

router.post('/', builderMasterController.createBuilder);
router.get('/', builderMasterController.getBuilders);
router.put('/:id', builderMasterController.updateBuilder);
router.delete('/:id', builderMasterController.deleteBuilder);

module.exports = router;
