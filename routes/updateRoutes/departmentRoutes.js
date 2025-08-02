const express = require("express");
const router = express.Router();
const departmentController = require("../../controllers/updateControllers/departmentMasterController");
const projectFilter = require("../../middleware/projectId");


router.post("/",projectFilter, departmentController.createDepartmentDetails);
router.post("/import",projectFilter, departmentController.importDepartmentFromExcel);
router.get("/",projectFilter, departmentController.getDepartmentDetails);
router.put("/:id",projectFilter, departmentController.updateDepartmentDetails);
router.delete("/:id",projectFilter, departmentController.deleteDepartmentDetails)

module.exports = router;