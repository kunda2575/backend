const express = require('express');
const router = express.Router();

const leadController = require("../../controllers/transactionControllers/leads")
const verifyToken = require('../../middleware/verfiyToken')


router.post('/',verifyToken, leadController.createLeadsDetails);


router.post('/leads/import', leadController.importLeadsFromExcel); // ✅ new route

router.get('/', verifyToken,leadController.getLeadDetails);

router.get('/leadSource', verifyToken,leadController.getLeadSourceDetails);
router.get('/leadStage', verifyToken,leadController.getLeadStageDetails);
router.get('/teamMember', verifyToken,leadController.getTeamMemberDetails);

// ✅ Get Material by ID (user-specific
router.get('/:id', verifyToken,leadController.getLeadDetailsById);

// ✅ Update Material (by ID)
router.put('/:id', verifyToken, leadController.updateLeadDetails);

// ✅ Delete Material (by ID)
router.delete('/:id', verifyToken, leadController.deleteLeadDetails);



module.exports = router;