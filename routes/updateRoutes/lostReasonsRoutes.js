const express = require('express');
const router = express.Router();

const leadReasonsController = require('../../controllers/updateControllers/lostReasonsController');
const verifyToken = require('../../middleware/verfiyToken');

router.post('/', verifyToken,leadReasonsController.createLostReasons);
router.get('/', verifyToken,leadReasonsController.getLostReasons);
router.put('/:id', verifyToken,leadReasonsController.updateLostReasons);
router.delete('/:id', verifyToken,leadReasonsController.deleteLostReasons);

module.exports = router;
