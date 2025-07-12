const express = require('express');
const router = express.Router();
const {verifyToken} = require("../Middlewares/authMiddleware");
const {filterUsers} = require("../controllers/personalizedSearchController/personalizedSearchController");
const {restrictAccess} = require("../Middlewares/planMiddlreware");


router.get('/search-user',verifyToken,restrictAccess("personalizedMatch"),filterUsers)

module.exports = router;