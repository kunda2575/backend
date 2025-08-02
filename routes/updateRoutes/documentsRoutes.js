const express = require('express');
const router = express.Router();
const controller = require('../../controllers/updateControllers/documentsController');
const projectFilter = require('../../middleware/projectId'); // JWT middleware

router.post('/', projectFilter, controller.upload.any(), controller.createDocumentsDetails);
router.post('/import', projectFilter, controller.upload.any(), controller.importDocumentFromExcel);
router.get('/', projectFilter, controller.getDocumentsDetails);
router.put('/:id', projectFilter, controller.upload.any(), controller.updateDocumentsDetails);
router.delete('/:id', projectFilter, controller.deleteDocumentsDetails);

module.exports = router;
