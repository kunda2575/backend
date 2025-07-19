const express = require('express');
const router = express.Router();

const rolesController = require('../../controllers/updateControllers/rolesMasterController');
const verifyToken = require('../../middleware/verfiyToken');

router.post('/', verifyToken,rolesController.createRoles);
router.post('/import', verifyToken,rolesController.importRolesData);
router.get('/', verifyToken,rolesController.getRoless);
router.put('/:id', verifyToken,rolesController.updateRoles);
router.delete('/:id', verifyToken,rolesController.deleteRoles);

module.exports = router;
