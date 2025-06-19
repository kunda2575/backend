const express = require("express");
const router = express.Router();

const customerRoutes = require('../../controllers/updateControllers/customerMasterController');
const verifyToken = require("../../middleware/verfiyToken");

// 👇 Change from .array("documents") to .any()
router.post("/", verifyToken, customerRoutes.upload.any(), customerRoutes.createCustomerDetails);
router.get("/", verifyToken, customerRoutes.getCustomerDetails);
router.put("/:customerId", verifyToken, customerRoutes.upload.any(), customerRoutes.updateCustomersDetails);
router.delete("/:customerId", verifyToken, customerRoutes.deleteCustomersDetails);

module.exports = router;
