const express = require('express');
const router = express.Router();
const {verifyToken} = require("../authMiddleware/authMiddleware");
const {findMatches} = require("../controllers/userMatchingControllers/userCommonMatchingController");


router.get('/common-matches',verifyToken,findMatches)

module.exports = router;