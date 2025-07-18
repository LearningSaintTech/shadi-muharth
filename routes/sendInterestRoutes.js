const express = require('express');
const router = express.Router();
const {verifyToken} = require("../Middlewares/authMiddleware");
const {sendInterest,getInterests} = require("../controllers/sendInterestController/sendInterestController");
const {restrictAccess} = require("../Middlewares/planMiddlreware");


router.post('/send-interest',verifyToken,restrictAccess("interestSend"),sendInterest);
router.get("/get-interest",verifyToken,restrictAccess("interestView"),getInterests)

module.exports = router;