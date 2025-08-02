const express = require('express');
const router = express.Router();

const unitTypeController = require('../../controllers/updateControllers/unitTypeController');
const projectFilter = require('../../middleware/projectId');

router.post('/', projectFilter,unitTypeController.createUnitType);
router.post('/import', projectFilter,unitTypeController.importUnitTypesExcelData);
router.get('/', projectFilter,unitTypeController.getUnitTypes);
router.put('/:id', projectFilter,unitTypeController.updateUnitType);
router.delete('/:id', projectFilter,unitTypeController.deleteUnitType);

module.exports = router;
