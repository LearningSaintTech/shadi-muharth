const express = require('express');
const router = express.Router();
const { getAllUsersDetails } = require('../controllers/getusersController/getusersController'); 
const {verifyToken} = require("../../Middlewares/authMiddleware");


router.get('/get-all-users', verifyToken,getAllUsersDetails);


module.exports = router;