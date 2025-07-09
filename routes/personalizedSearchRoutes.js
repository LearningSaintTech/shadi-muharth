const express = require('express');
const router = express.Router();
const {verifyToken} = require("../authMiddleware/authMiddleware");
const {filterUsers} = require("../controllers/personalizedSearchController/personalizedSearchController");


router.get('/search-user',verifyToken,filterUsers)

module.exports = router;