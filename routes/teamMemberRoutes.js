const express = require("express")
const router = express.Router();

const teamRoutes = require('../controllers/teamMembersController');
const verifyToken = require("../middleware/verfiyToken");

router.post("/",verifyToken,teamRoutes.createTeamMemberDetails)
router.get("/",verifyToken,teamRoutes.getTeamMemberDetails)
router.put("/:id",verifyToken,teamRoutes.updateTeamMemberDetails)
router.delete("/:id",verifyToken,teamRoutes.deleteTeamMemberDetails)

module.exports=router