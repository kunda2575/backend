const express = require("express")
const router = express.Router();

const employeeRoutes = require('../controllers/employeeMasterController')

router.post("/",employeeRoutes.createEmployeeDetails)
router.get("/",employeeRoutes.getEmployeeDetails)
router.put("/:employeeID",employeeRoutes.updateEmployeesDetails)
router.delete("/:employeeID",employeeRoutes.deleteEmployeesDetails)

module.exports=router