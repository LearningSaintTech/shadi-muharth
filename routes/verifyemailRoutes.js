const express = require('express');
const router = express.Router();
const {verifyToken} = require("../authMiddleware/authMiddleware");
const {sendEmailOTP,verifyEmailOTP,resendEmailOTP} = require("../controllers/emailVerifyController/emailVerifyController");


router.post('/send-emailOTP',verifyToken,sendEmailOTP)
router.post('/verify-emailOTP',verifyToken,verifyEmailOTP)
router.post('/resend-emailOTP',verifyToken,resendEmailOTP)

module.exports = router;