const express = require("express");
const router = express.Router();
const blocksController = require('../controllers/blockMasterController');

router.post('/', blocksController.createBlock);
router.get('/', blocksController.getBlocks);
router.put('/:id', blocksController.updateBlock);
router.delete('/:id', blocksController.deleteBlock);

module.exports = router;
