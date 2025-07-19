const express = require("express");
const router = express.Router();
const departmentController = require("../../controllers/updateControllers/departmentMasterController");
const verifyToken = require("../../middleware/verfiyToken");


router.post("/",verifyToken, departmentController.createDepartmentDetails);
router.post("/import",verifyToken, departmentController.importDepartmentFromExcel);
router.get("/",verifyToken, departmentController.getDepartmentDetails);
router.put("/:id",verifyToken, departmentController.updateDepartmentDetails);
router.delete("/:id",verifyToken, departmentController.deleteDepartmentDetails)

module.exports = router;