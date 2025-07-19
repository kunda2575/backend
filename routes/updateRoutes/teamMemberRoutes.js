const express = require("express")
const router = express.Router();

const teamRoutes = require('../../controllers/updateControllers/teamMembersController');
const verifyToken = require("../../middleware/verfiyToken");

router.post("/",verifyToken,teamRoutes.createTeamMemberDetails)
router.post("/import",verifyToken,teamRoutes.importTeamMembersExcelData)
router.get("/",verifyToken,teamRoutes.getTeamMemberDetails)
router.put("/:id",verifyToken,teamRoutes.updateTeamMemberDetails)
router.delete("/:id",verifyToken,teamRoutes.deleteTeamMemberDetails)

module.exports=router