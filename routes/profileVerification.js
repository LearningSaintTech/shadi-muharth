const express = require('express');
const router = express.Router();
const {verifyToken} = require("../Middlewares/authMiddleware");
const {sendVerificationOnly,getVerifications} = require("../controllers/profileVerificationController/profileVerificationController");


router.post('/send-profileVerification',verifyToken,sendVerificationOnly);
router.get("/get-profileVerification",verifyToken,getVerifications)

module.exports = router;