const express = require("express")
const router = express.Router();

const projectRoutes = require('../../controllers/updateControllers/projectMasterController');
const verifyToken = require("../../middleware/verfiyToken");

router.post("/",verifyToken,projectRoutes.createProjectDetails)
router.get("/",verifyToken,projectRoutes.getProjectDetails)
router.put("/:id",verifyToken,projectRoutes.updateProjectsDetails)
router.delete("/:id",verifyToken,projectRoutes.deleteProjectsDetails)

module.exports=router