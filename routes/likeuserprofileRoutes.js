const express = require('express');
const router = express.Router();
const {verifyToken} = require("../authMiddleware/authMiddleware");
const {likeProfile,unlikeProfile} = require("../controllers/likeuserprofileController/likeuserprofileController");


router.post('/like-user-profile',verifyToken,likeProfile);
router.post('/unlike-user-profile',verifyToken,unlikeProfile);

module.exports = router;