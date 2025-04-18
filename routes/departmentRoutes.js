const express = require("express");
const router = express.Router();
const departmentController = require("../controllers/departmentMasterController");
const verifyToken = require("../middleware/verfiyToken");


router.post("/",verifyToken, departmentController.createDepartmentDetails);
router.get("/",verifyToken, departmentController.getDepartmentDetails);
router.put("/:departmentID",verifyToken, departmentController.updateDepartmentDetails);
router.delete("/:departmentID",verifyToken, departmentController.deleteDepartmentDetails)

module.exports = router;