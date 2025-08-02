const express = require("express")
const router = express.Router();
const employeeRoutes = require('../../controllers/updateControllers/employeeMasterController');
const projectFilter = require("../../middleware/projectId");

// File Upload Middleware (Multer)
const upload = employeeRoutes.upload;

router.post("/",projectFilter, upload.any(),employeeRoutes.createEmployeeDetails)
router.post("/import",projectFilter, upload.any(),employeeRoutes.importEmployeeExcelData)
router.get("/",projectFilter,employeeRoutes.getEmployeeDetails)
router.put("/:id",projectFilter, upload.any(),employeeRoutes.updateEmployeesDetails)
router.delete("/:id",projectFilter,employeeRoutes.deleteEmployeesDetails)

module.exports=router