const express = require("express");
const signUpController = require("../../controllers/updateControllers/signUpController");


const verifyToken = require("../../middleware/verfiyToken")
const router = express.Router();

router.post("/send-otp",signUpController.sendOtp);

router.post("/verify-otp",signUpController.verifyOtp)

router.post("/register", signUpController.userRegister);

router.get("/getUser", verifyToken,signUpController.getUserProfile);

router.get("/updateUser", verifyToken,signUpController.updateUserDetails);

router.post("/login", signUpController.userLogin);

router.post("/forgot-password", signUpController.forgotPassword);


router.post("/reset-password", signUpController.resetPassword);

module.exports = router;
