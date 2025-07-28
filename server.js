const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const userAuthRoutes = require("./user-panel/routes/AuthRoutes");
const userPersonalInfoRoutes = require("./user-panel/routes/userProfileRoutes");
const userMatchingRoutes = require("./user-panel/routes/userMatchingRoutes");
const favouriteUserRoutes = require("./user-panel/routes/FavoruiteUserRoutes");
const likeuserProfileRoutes = require("./user-panel/routes/likeuserprofileRoutes");
const personalizedSearchRoutes = require("./user-panel/routes/personalizedSearchRoutes");
const subscriptionplanRoutes = require("./user-panel/routes/subscriptionplanRoutes");
const searchUserRoutes = require("./user-panel/routes/searchUserRoutes");
const emailVerifyRoutes = require("./user-panel/routes/verifyemailRoutes");
const documentsVerificationRoutes = require("./user-panel/routes/documentsverificationRoutes");
const sendInterestRoutes = require("./user-panel/routes/sendInterestRoutes");
const sendprofileVerificationRoutes = require("./user-panel/routes/profileVerification");
const buyPlanRoutes = require("./user-panel/routes/buyPlanRoutes");
const showTagRoutes = require("./user-panel/routes/showplantagRoutes");
const chatRoutes = require("./user-panel/routes/chatRoutes");
const deleteAccountRoutes = require("./user-panel/routes/deleteprofileRoutes");
const reportProfileRoutes = require("./user-panel/routes/reportProfileRoutes");



const superadminAuthRoutes = require("./Super-Admin-Panel/routes/authRoutes");
const usercountRoutes = require("./Super-Admin-Panel/routes/usercountRoutes");
const getalluserRoutes = require("./Super-Admin-Panel/routes/getusersRoutes");
const subscriptionPlansRoutes = require("./Super-Admin-Panel/routes/subscriptionplansRoutes");
const getAllUserspaymentDetails = require("./Super-Admin-Panel/routes/paymentPageRoutes");
const uploadTestimonials = require("./Super-Admin-Panel/routes/testimonialRoutes");
const verifyprofileRoutes = require("./Super-Admin-Panel/routes/verifyProfileRoutes");


const notificationHistory = require("./common/routes/notificationRoutes");

const app = express();
const PORT = process.env.PORT;

// Database Connection
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root Route
app.get("/", (req, res) => {
  res.send("Server is Running");
});


//user-panel

//UserAuthentication
app.use("/api/auth",userAuthRoutes)

//user-profile routes
app.use("/api/user",userPersonalInfoRoutes);

//user-matching routes
app.use("/api/user/matching",userMatchingRoutes)

//favourite-user routes
app.use("/api/user/favourite",favouriteUserRoutes)

//like-user-profile routes
app.use("/api/user/likes",likeuserProfileRoutes)


//personalized-search-routes
app.use("/api/user/personalized-search",personalizedSearchRoutes)

//subscription-plan routes
app.use("/api/plans",subscriptionplanRoutes)

//search-user routes
app.use("/api/user/search",searchUserRoutes)

//verify-email routes
app.use("/api/user/email",emailVerifyRoutes)

//document-verification routes
app.use("/api/user/documents",documentsVerificationRoutes)

//send-interest routes
app.use("/api/user/interest",sendInterestRoutes)

//profile-verification routes 
app.use("/api/user/verification",sendprofileVerificationRoutes)

//buy-plan routes
app.use("/api/user/buy-plan",buyPlanRoutes)

//show-tag routes
app.use("/api/user/tag",showTagRoutes)

//chat routes
app.use("/api/user/chat",chatRoutes)

//delete-account Routes
app.use("/api/user/delete",deleteAccountRoutes)

//report-profile Routes
app.use("/api/user/report",reportProfileRoutes)


//super-admin-panel 

// auth routes
app.use("/api/superadmin/auth",superadminAuthRoutes)

//count user routes
app.use("/api/superadmin/count",usercountRoutes)

//get-all-user routes
app.use("/api/superadmin/users",getalluserRoutes)

//subscription-plan routes
app.use("/api/superadmin/plans",subscriptionPlansRoutes)

//payments routes
app.use("/api/superadmin/payments",getAllUserspaymentDetails)

//upload-testimonials routes
app.use('/api/superadmin/testimonials',uploadTestimonials)

//profile-verification routes
app.use("/api/superadmin/profileVerification",verifyprofileRoutes)


//common routes

//Notification-history
app.use("/api/notification-history",notificationHistory);

// Start Server
app.listen(PORT, "0.0.0.0", () =>
  console.log(`Server running on http://localhost:${PORT}`)
);