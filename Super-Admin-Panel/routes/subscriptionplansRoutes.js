const express = require('express');
const router = express.Router();
const {getSubscriptionPlans,updateSubscriptionPlan } = require('../controllers/subscriptionplanController/subscriptionplanController'); 
const {verifyToken} = require("../../Middlewares/authMiddleware");


router.get('/get-plan-details', verifyToken,getSubscriptionPlans);
router.put("/update-plan/:id",verifyToken,updateSubscriptionPlan)


module.exports = router;