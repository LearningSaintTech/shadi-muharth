const express = require('express');
const router = express.Router();
const { getAllUsersDetails,exportUsersToCsv ,getUserById} = require('../controllers/getusersController/getusersController'); 
const {verifyToken} = require("../../Middlewares/authMiddleware");


router.get('/get-all-users', verifyToken,getAllUsersDetails);
router.get("/export-to-csv",verifyToken,exportUsersToCsv);
router.get("/get-user-by-Id/:id",verifyToken,getUserById);


module.exports = router;