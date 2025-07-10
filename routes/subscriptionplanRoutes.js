const express = require('express');
const router = express.Router();
const {verifyToken} = require("../authMiddleware/authMiddleware");
const {addPlan,getPlanById} = require("../controllers/subscriptionplanController/subscriptionplanController");


router.post('/add-plan',addPlan)

router.get("/get-single-plan/:id",verifyToken,getPlanById)

module.exports = router;