const express = require('express');
const router = express.Router();

const lostReasonController = require('../controllers/lostReasonsController');
const verifyToken = require('../middleware/verfiyToken');

router.post('/', verifyToken,lostReasonController.createLostReasons);
router.get('/', verifyToken,lostReasonController.getLostReasons);
router.put('/:id', verifyToken,lostReasonController.updateLostReasons);
router.delete('/:id', verifyToken,lostReasonController.deleteLostReasons);

module.exports = router;
