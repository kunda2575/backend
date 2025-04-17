const express = require("express")
const router = express.Router();

const customerRoutes = require('../controllers/customerMasterController')

router.post("/",customerRoutes.createCustomerDetails)
router.get("/",customerRoutes.getCustomerDetails)
router.put("/:customerId",customerRoutes.updateCustomersDetails)
router.delete("/:customerId",customerRoutes.deleteCustomersDetails)

module.exports=router