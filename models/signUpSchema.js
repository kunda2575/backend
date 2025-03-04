const mongoose = require("mongoose");

const signUpSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    userName: { type: String, required: true },
    mobileNumber: { type: Number, required: true },
    email: { type: String, required: true, unique: true },
    profile: { type: String, required: true },
    password: { type: String, required: true },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null }
});

module.exports = mongoose.model("User", signUpSchema);
