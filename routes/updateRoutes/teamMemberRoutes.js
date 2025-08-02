const express = require("express")
const router = express.Router();

const teamRoutes = require('../../controllers/updateControllers/teamMembersController');
const projectFilter = require("../../middleware/projectId");

router.post("/",projectFilter,teamRoutes.createTeamMemberDetails)
router.post("/import",projectFilter,teamRoutes.importTeamMembersExcelData)
router.get("/",projectFilter,teamRoutes.getTeamMemberDetails)
router.put("/:id",projectFilter,teamRoutes.updateTeamMemberDetails)
router.delete("/:id",projectFilter,teamRoutes.deleteTeamMemberDetails)

module.exports=router