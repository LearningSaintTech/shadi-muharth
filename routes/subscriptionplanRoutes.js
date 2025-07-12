const express = require('express');
const router = express.Router();
const {verifyToken} = require("../Middlewares/authMiddleware");
const {addPlan,getPlanById,getPlans} = require("../controllers/subscriptionplanController/subscriptionplanController");


router.post('/add-plan',addPlan)

router.get("/get-plans",getPlans)

router.get("/get-single-plan/:id",verifyToken,getPlanById)

module.exports = router;