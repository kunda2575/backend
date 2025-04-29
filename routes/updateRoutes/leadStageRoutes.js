const express = require('express');
const router = express.Router();

const leadStageController = require('../../controllers/updateControllers/leadStageController');
const verifyToken = require('../../middleware/verfiyToken');

router.post('/', verifyToken,leadStageController.createLeadStage);
router.get('/', verifyToken,leadStageController.getLeadStages);
router.put('/:id', verifyToken,leadStageController.updateLeadStage);
router.delete('/:id', verifyToken,leadStageController.deleteLeadStage);

module.exports = router;
