const express = require('express');
const router = express.Router();
const {verifyToken} = require("../../Middlewares/authMiddleware");
const {getNotificationHistory,deleteNotification} = require("../controllers/notificationController");



router.get("/get-notification-history",verifyToken,getNotificationHistory);
router.delete("/delete-notification",verifyToken,deleteNotification)

module.exports = router;
