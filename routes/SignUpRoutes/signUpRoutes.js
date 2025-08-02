const express = require("express");
const signUpController = require("../../controllers/updateControllers/signUpController");


const verifyToken = require("../../middleware/verfiyToken")
const router = express.Router();
// ✅ Public Routes
router.post('/check-email', signUpController.checkEmailExists);
router.post("/send-otp", signUpController.sendOtp);
router.post("/verify-otp", signUpController.verifyOtp);
router.post("/register", signUpController.userRegister);
router.post("/login", signUpController.userLogin);
router.post("/forgot-password", signUpController.forgotPassword);
router.post("/reset-password", signUpController.resetPassword);
router.post("/import", signUpController.importUsersExcelData);

router.delete('/:id', signUpController.deleteUser);
// 🔒 Protected Routes
// router.use(verifyToken); 

router.get("/by-project/:projectId", signUpController.getUsersByProject);
router.get("/getUser",verifyToken, signUpController.getUserProfile);
router.get("/project", signUpController.getProjectDetails);
router.get("/getUsers", signUpController.getUser);

router.put("/updateUser/:userId", verifyToken,signUpController.updateUserDetails);
module.exports = router;
