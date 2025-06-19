const express = require('express');
const router = express.Router();
const controller = require('../../controllers/updateControllers/documentsController');
const authenticate = require('../../middleware/verfiyToken'); // your JWT middleware

// Use Multer for multi-file upload (e.g., upload.array('documentsUpload', 10))
router.post('/', authenticate, controller.upload.array('documentsUpload',10), controller.createDocumentsDetails);
router.get('/', authenticate, controller.getDocumentsDetails);
router.put('/:id', authenticate, controller.upload.array('documentsUpload'), controller.updateDocumentsDetails);
router.delete('/:id', authenticate, controller.deleteDocumentsDetails);

module.exports = router;
