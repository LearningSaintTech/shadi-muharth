const express = require('express');
const router = express.Router();
const {verifyToken} = require("../../Middlewares/authMiddleware");
const {deleteProfile} = require("../controllers/deleteProfileController/deleteController");


router.delete('/delete-account',verifyToken,deleteProfile);

module.exports = router;
