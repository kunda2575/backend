const express = require('express');
const router = express.Router();
const controller = require('../../controllers/updateControllers/documentsController');
const authenticate = require('../../middleware/verfiyToken'); // JWT middleware

router.post('/', authenticate, controller.upload.any(), controller.createDocumentsDetails);
router.get('/', authenticate, controller.getDocumentsDetails);
router.put('/:id', authenticate, controller.upload.any(), controller.updateDocumentsDetails);
router.delete('/:id', authenticate, controller.deleteDocumentsDetails);

module.exports = router;
