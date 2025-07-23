const express = require('express');
const router = express.Router();
const {getAllUserspaymentDetails } = require('../controllers/paymentController/paymentController'); 
const {verifyToken} = require("../../Middlewares/authMiddleware");


router.get('/get-user-payment-Details', verifyToken,getAllUserspaymentDetails);



module.exports = router;