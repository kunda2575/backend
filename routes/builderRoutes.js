const express = require('express');
const router = express.Router();
const verifyToken = require("../middleware/verfiyToken")

const builderMasterController = require('../controllers/builderMasterController')

router.post('/',verifyToken, builderMasterController.createBuilder);
router.get('/', verifyToken, builderMasterController.getBuilders);
router.put('/:id',verifyToken, builderMasterController.updateBuilder);
router.delete('/:id',verifyToken, builderMasterController.deleteBuilder);

module.exports = router;
