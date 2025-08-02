const express = require('express');
const router = express.Router();

const leadSourceController = require('../../controllers/updateControllers/leadSourceController');
const projectFilter = require('../../middleware/projectId');

router.post('/', projectFilter,leadSourceController.createLeadSource);
router.post('/import', projectFilter,leadSourceController.importLeadSourceData);
router.get('/', projectFilter,leadSourceController.getLeadSources);
router.put('/:id', projectFilter,leadSourceController.updateLeadSource);
router.delete('/:id', projectFilter,leadSourceController.deleteLeadSource);

module.exports = router;
