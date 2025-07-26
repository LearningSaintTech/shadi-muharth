const express = require('express');
const router = express.Router();
const {verifyToken} = require("../../Middlewares/authMiddleware");
const {likeProfile,unlikeProfile,getLikesCount} = require("../controllers/likeuserprofileController/likeuserprofileController");


router.post('/like-user-profile',verifyToken,likeProfile);
router.post('/unlike-user-profile',verifyToken,unlikeProfile);
router.get("/get-like-count",verifyToken,getLikesCount)

module.exports = router;