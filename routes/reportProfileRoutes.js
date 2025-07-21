const express = require('express');
const router = express.Router();
const {verifyToken} = require("../Middlewares/authMiddleware");
const {reportUserProfile} = require("../controllers/ReportProfileController/reportProfileController");


router.post('/report-user',verifyToken,reportUserProfile);

module.exports = router;
