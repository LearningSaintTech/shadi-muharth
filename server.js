const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const userAuthRoutes = require("./routes/AuthRoutes");
const userPersonalInfoRoutes = require("./routes/userProfileRoutes");
const userMatchingRoutes = require("./routes/userMatchingRoutes");
const favouriteUserRoutes = require("./routes/FavoruiteUserRoutes");

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



// Start Server
app.listen(PORT, "0.0.0.0", () =>
  console.log(`Server running on http://localhost:${PORT}`)
);