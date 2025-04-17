const express = require("express");
const router = express.Router();

const departmentController = require("../controllers/departmentMasterController");


router.post("/", departmentController.createDepartmentDetails);
router.get("/", departmentController.getDepartmentDetails);
router.put("/:departmentID", departmentController.updateDepartmentDetails);
router.delete("/:departmentID", departmentController.deleteDepartmentDetails)

module.exports = router;