const express = require('express');
const router = express.Router();
const {verifyToken} = require("../../Middlewares/authMiddleware");
const {saveFavouriteUser,getFavouriteUsers} = require("../controllers/userFavouriteControllers/FavouriteUserController");


router.post('/save-Favourite-user',verifyToken,saveFavouriteUser)
router.get('/get-Favourite-user',verifyToken,getFavouriteUsers)

module.exports = router;