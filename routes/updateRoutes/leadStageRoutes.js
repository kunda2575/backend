const express = require('express');
const router = express.Router();

const leadStageController = require('../../controllers/updateControllers/leadStageController');
const projectFilter = require('../../middleware/projectId');

router.post('/', projectFilter,leadStageController.createLeadStage);
router.post('/import', projectFilter,leadStageController.importLeadStageData);
router.get('/', projectFilter,leadStageController.getLeadStages);
router.put('/:id', projectFilter,leadStageController.updateLeadStage);
router.delete('/:id', projectFilter,leadStageController.deleteLeadStage);

module.exports = router;
