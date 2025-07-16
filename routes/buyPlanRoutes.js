const express = require('express');
const router = express.Router();
const {verifyToken} = require("../Middlewares/authMiddleware");
const {changePlan,getPlanDetails} = require("../controllers/buyPlanController/buyPlanController");


router.post('/change-plan',verifyToken,changePlan);
router.get("/get-planDetails",verifyToken,getPlanDetails)

module.exports = router;
