const express = require('express');
const router = express.Router();

const materialMasterController = require('../../controllers/updateControllers/materialMasterController');
const projectFilter = require('../../middleware/projectId');

router.post('/', projectFilter,materialMasterController.createMaterialMaster);
router.post('/import', projectFilter,materialMasterController.importMaterialMasterData);
router.get('/', projectFilter,materialMasterController.getMaterialMasters);
router.put('/:id', projectFilter,materialMasterController.updateMaterialMaster);
router.delete('/:id', projectFilter,materialMasterController.deleteMaterialMaster);

module.exports = router;
