const express = require("express")
const router = express.Router();
const employeeRoutes = require('../controllers/employeeMasterController');
const verifyToken = require("../middleware/verfiyToken");

router.post("/",verifyToken,employeeRoutes.createEmployeeDetails)
router.get("/",verifyToken,employeeRoutes.getEmployeeDetails)
router.put("/:employeeID",verifyToken,employeeRoutes.updateEmployeesDetails)
router.delete("/:employeeID",verifyToken,employeeRoutes.deleteEmployeesDetails)

module.exports=router