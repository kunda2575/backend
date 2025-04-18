const express = require('express');
const router = express.Router();

const leadSourceController = require('../controllers/leadSourceController');
const verifyToken = require('../middleware/verfiyToken');

router.post('/', verifyToken,leadSourceController.createLeadSource);
router.get('/', verifyToken,leadSourceController.getLeadSources);
router.put('/:id', verifyToken,leadSourceController.updateLeadSource);
router.delete('/:id', verifyToken,leadSourceController.deleteLeadSource);

module.exports = router;
