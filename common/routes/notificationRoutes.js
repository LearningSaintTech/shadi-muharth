const express = require('express');
const router = express.Router();
const {verifyToken} = require("../../Middlewares/authMiddleware");
const {getNotificationHistory} = require("../controllers/notificationController");



router.get("/get-notification-history",verifyToken,getNotificationHistory)

module.exports = router;
