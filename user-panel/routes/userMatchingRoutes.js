const express = require('express');
const router = express.Router();
const {verifyToken} = require("../../Middlewares/authMiddleware");
const {findMatches} = require("../controllers/userMatchingControllers/userCommonMatchingController");


router.get('/common-matches',verifyToken,findMatches)

module.exports = router;