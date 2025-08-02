const express = require('express');
const router = express.Router();

const leadReasonsController = require('../../controllers/updateControllers/lostReasonsController');
const projectFilter = require('../../middleware/projectId');

router.post('/', projectFilter,leadReasonsController.createLostReasons);
router.post('/import', projectFilter,leadReasonsController.importLostReasonsData);
router.get('/', projectFilter,leadReasonsController.getLostReasons);
router.put('/:id', projectFilter,leadReasonsController.updateLostReasons);
router.delete('/:id', projectFilter,leadReasonsController.deleteLostReasons);

module.exports = router;
