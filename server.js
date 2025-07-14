const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const userAuthRoutes = require("./routes/AuthRoutes");
const userPersonalInfoRoutes = require("./routes/userProfileRoutes");
const userMatchingRoutes = require("./routes/userMatchingRoutes");
const favouriteUserRoutes = require("./routes/FavoruiteUserRoutes");
const likeuserProfileRoutes = require("./routes/likeuserprofileRoutes");
const personalizedSearchRoutes = require("./routes/personalizedSearchRoutes");
const subscriptionplanRoutes = require("./routes/subscriptionplanRoutes");
const searchUserRoutes = require("./routes/searchUserRoutes");
const emailVerifyRoutes = require("./routes/verifyemailRoutes");
const documentsVerificationRoutes = require("./routes/documentsverificationRoutes");
const sendInterestRoutes = require("./routes/sendInterestRoutes");
const sendprofileVerificationRoutes = require("./routes/profileVerification");

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
  res.send("Server Running");
});

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

// Start Server
app.listen(PORT, "0.0.0.0", () =>
  console.log(`Server running on http://localhost:${PORT}`)
);