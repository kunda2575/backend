const express = require('express');
const router = express.Router();

const materialMasterController = require('../../controllers/updateControllers/materialMasterController');
const verifyToken = require('../../middleware/verfiyToken');

router.post('/', verifyToken,materialMasterController.createMaterialMaster);
router.post('/import', verifyToken,materialMasterController.importMaterialMasterData);
router.get('/', verifyToken,materialMasterController.getMaterialMasters);
router.put('/:id', verifyToken,materialMasterController.updateMaterialMaster);
router.delete('/:id', verifyToken,materialMasterController.deleteMaterialMaster);

module.exports = router;
