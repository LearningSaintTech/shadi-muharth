const express = require('express');
const router = express.Router();
const { getUserCount,getSubscribedUserCount,getGoldUserCount,getSilverUserCount } = require('../controllers/usercountController/usercountController'); 
const {verifyToken} = require("../../Middlewares/authMiddleware");


router.get('/user-count', verifyToken,getUserCount);
router.get("/subscribed-user-count",verifyToken,getSubscribedUserCount)
router.get("/gold-user-count",verifyToken,getGoldUserCount)
router.get("/silver-user-count",verifyToken,getSilverUserCount)

module.exports = router;