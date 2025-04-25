const express = require("express")
const router = express.Router();

const customerRoutes = require('../controllers/customerMasterController');
const verifyToken = require("../middleware/verfiyToken");

router.post("/",verifyToken,customerRoutes.createCustomerDetails)
router.get("/",verifyToken,customerRoutes.getCustomerDetails)
router.put("/:id",verifyToken,customerRoutes.updateCustomersDetails)
router.delete("/:id",verifyToken,customerRoutes.deleteCustomersDetails)

module.exports=router