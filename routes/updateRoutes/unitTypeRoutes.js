const express = require('express');
const router = express.Router();

const unitTypeController = require('../../controllers/updateControllers/unitTypeController');
const verifyToken = require('../../middleware/verfiyToken');

router.post('/', verifyToken,unitTypeController.createUnitType);
router.post('/import', verifyToken,unitTypeController.importUnitTypesExcelData);
router.get('/', verifyToken,unitTypeController.getUnitTypes);
router.put('/:id', verifyToken,unitTypeController.updateUnitType);
router.delete('/:id', verifyToken,unitTypeController.deleteUnitType);

module.exports = router;
