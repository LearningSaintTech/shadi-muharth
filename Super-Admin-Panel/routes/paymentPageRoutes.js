const express = require('express');
const router = express.Router();
const {getAllUserspaymentDetails,exportToCsvController } = require('../controllers/paymentController/paymentController'); 
const {verifyToken} = require("../../Middlewares/authMiddleware");


router.get('/get-user-payment-Details', verifyToken,getAllUserspaymentDetails);
router.get("/export-user-payment-to-csv",verifyToken,exportToCsvController);


module.exports = router;