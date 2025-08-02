const express = require("express");
const router = express.Router();
const blocksController = require('../../controllers/updateControllers/blockMasterController');
const projectFilter = require('../../middleware/projectId')

router.post('/', projectFilter, blocksController.createBlock);
router.post('/import', projectFilter, blocksController.importBlockFromExcel);
router.get('/', projectFilter, blocksController.getBlocks);
router.put('/:id', projectFilter, blocksController.updateBlock);
router.delete('/:id', projectFilter, blocksController.deleteBlock);

module.exports = router;
