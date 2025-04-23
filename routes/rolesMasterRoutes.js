const express = require('express');
const router = express.Router();

const rolesController = require('../controllers/rolesMasterController');
const verifyToken = require('../middleware/verfiyToken');

router.post('/', verifyToken,rolesController.createRoles);
router.get('/', verifyToken,rolesController.getRoless);
router.put('/:id', verifyToken,rolesController.updateRoles);
router.delete('/:id', verifyToken,rolesController.deleteRoles);

module.exports = router;
