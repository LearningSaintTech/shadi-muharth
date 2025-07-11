const express = require('express');
const router = express.Router();
const {verifyToken} = require("../authMiddleware/authMiddleware");
const {searchUsers} = require("../controllers/searchUserController/searchUserController");


router.get('/search-users',verifyToken,searchUsers)

module.exports = router;