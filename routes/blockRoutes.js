const express = require("express");
const router = express.Router();
const blocksController = require('../controllers/blockMasterController');
const verifyToken = require('../middleware/verfiyToken')

router.post('/', verifyToken, blocksController.createBlock);
router.get('/', verifyToken, blocksController.getBlocks);
router.put('/:id', verifyToken, blocksController.updateBlock);
router.delete('/:id', verifyToken, blocksController.deleteBlock);

module.exports = router;
