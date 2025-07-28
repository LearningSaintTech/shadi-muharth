const express = require('express');
const router = express.Router();
const {getAllVerifications,getUserVerificationById,exportVerificationsToCsv,sendUploadDocumentNotification} = require("../controllers/profileVerificationController/verifyProfileController");
const {verifyToken} = require("../../Middlewares/authMiddleware");


router.get('/get-all-profile-verification', verifyToken,getAllVerifications);

router.get('/get-profile-verification-by-Id/:id', verifyToken,getUserVerificationById);

router.get('/get-verification-to-csv', verifyToken,exportVerificationsToCsv);

router.post("/send-notificaiton",verifyToken,sendUploadDocumentNotification)


module.exports = router;