const express = require('express');
const router = express.Router();
const {verifyToken} = require("../Middlewares/authMiddleware");
const {showTag} = require("../controllers/showplanTagController/showtagController");
const {restrictAccess} = require("../Middlewares/planMiddlreware");


router.get('/show-tags/:userId',verifyToken,restrictAccess("profilePlanTag"),showTag);

module.exports = router;