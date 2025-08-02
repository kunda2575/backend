const express = require('express');
const router = express.Router();

const leadController = require("../../controllers/transactionControllers/leads")
const projectFiter = require('../../middleware/projectId')


router.post('/',projectFiter, leadController.createLeadsDetails);


router.post('/leads/import', projectFiter,leadController.importLeadsFromExcel); // ✅ new route

router.get('/', projectFiter,leadController.getLeadDetails);

router.get('/leadSource', projectFiter,leadController.getLeadSourceDetails);
router.get('/leadStage', projectFiter,leadController.getLeadStageDetails);
router.get('/teamMember', projectFiter,leadController.getTeamMemberDetails);

// ✅ Get Material by ID (user-specific
router.get('/:id', projectFiter,leadController.getLeadDetailsById);

// ✅ Update Material (by ID)
router.put('/:id', projectFiter, leadController.updateLeadDetails);

// ✅ Delete Material (by ID)
router.delete('/:id', projectFiter, leadController.deleteLeadDetails);



module.exports = router;