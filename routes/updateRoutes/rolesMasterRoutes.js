const express = require('express');
const router = express.Router();

const rolesController = require('../../controllers/updateControllers/rolesMasterController');
const projectFilter = require('../../middleware/projectId');

router.post('/', projectFilter,rolesController.createRoles);
router.post('/import', projectFilter,rolesController.importRolesData);
router.get('/', projectFilter,rolesController.getRoless);
router.put('/:id', projectFilter,rolesController.updateRoles);
router.delete('/:id', projectFilter,rolesController.deleteRoles);

module.exports = router;
