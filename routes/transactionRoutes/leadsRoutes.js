const express = require('express');
const router = express.Router();

const leadController = require("../../controllers/transactionControllers/leads")
const verifyToken = require('../../middleware/verfiyToken')


router.post('/',verifyToken, leadController.createLeadsDetails);
router.get('/', verifyToken,leadController.getLeadDetails);
router.get('/leadSource', verifyToken,leadController.getLeadSourceDetails);
router.get('/leadStage', verifyToken,leadController.getLeadStageDetails);
router.get('/teamMember', verifyToken,leadController.getTeamMemberDetails);

module.exports = router;