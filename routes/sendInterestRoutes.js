const express = require('express');
const router = express.Router();
const {verifyToken} = require("../Middlewares/authMiddleware");
const {sendInterest,getInterests} = require("../controllers/sendInterestController/sendInterestController");


router.post('/send-interest',verifyToken,sendInterest);
router.get("/get-interest",verifyToken,getInterests)

module.exports = router;