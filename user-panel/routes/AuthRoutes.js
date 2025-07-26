const express = require('express');
const router = express.Router();
const {  verifyOTP , resendOTP , login,storeFcmToken} = require('../controllers/authController/AuthController');
const {verifyToken} = require("../../Middlewares/authMiddleware");


// Route for OTP verification
router.post('/verify-otp', verifyOTP);

// Route for resend-otp
router.post('/resend-otp',resendOTP)

//Route for login
router.post("/login",login);

//Route for storing fcm-token
router.post("/save-fcm-token",verifyToken,storeFcmToken)

module.exports = router;