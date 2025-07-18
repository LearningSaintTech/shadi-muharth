const express = require('express');
const router = express.Router();
const {verifyToken} = require("../Middlewares/authMiddleware");
const {sendVerificationOnly,getVerifications} = require("../controllers/profileVerificationController/profileVerificationController");
const {restrictAccess} = require("../Middlewares/planMiddlreware");

router.post('/send-profileVerification',verifyToken,restrictAccess("profileVerification"),sendVerificationOnly);
router.get("/get-profileVerification",verifyToken,getVerifications)

module.exports = router;