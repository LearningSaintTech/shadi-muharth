const mongoose = require('mongoose');
const FavouriteUser = require('../../models/FavouriteUser/favouriteUser');
const UserPersonalInfo = require('../../models/userProfile/userPersonalinfo');
const UserProfileImage = require('../../models/userProfile/userProfileImage');
const UserAuth = require("../../models/userAuth/Auth");
const { apiResponse } = require('../../../utils/apiResponse');

// Helper function to calculate age from DOB
const calculateAge = (dob) => {
  if (!dob) return null;
  const diff = Date.now() - new Date(dob).getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};


// Save a favorite user  
const saveFavouriteUser = async (req, res) => {
  try {
    const { favouriteUserId } = req.body;

    // Validate inputs
    if (!mongoose.Types.ObjectId.isValid(req.userId) || !mongoose.Types.ObjectId.isValid(favouriteUserId)) {
      return apiResponse(res, {
        success: false,
        message: 'Invalid user ID or favourite user ID',
        statusCode: 400
      });
    }

    const userId = new mongoose.Types.ObjectId(req.userId);
    const favUserId = new mongoose.Types.ObjectId(favouriteUserId);

    // Prevent self-favoriting
    if (userId.equals(favUserId)) {
      return apiResponse(res, {
        success: false,
        message: 'Cannot add yourself as a favorite',
        statusCode: 400
      });
    }

    // Check if favourite user exists
    const favouriteUserExists = await UserAuth.findById(favUserId);
    if (!favouriteUserExists) {
      return apiResponse(res, {
        success: false,
        message: 'Favourite user not found',
        statusCode: 404
      });
    }

    // Check for existing favorite
    const existingFavourite = await FavouriteUser.findOne({ userId, favouriteUserId: favUserId });
    if (existingFavourite) {
      return apiResponse(res, {
        success: false,
        message: 'User is already marked as a favorite',
        statusCode: 409
      });
    }

    // Save favorite user
    const favouriteUser = new FavouriteUser({ userId, favouriteUserId: favUserId });
    const savedFavourite = await favouriteUser.save();

    // Populate additional details
    const userPersonalInfo = await UserPersonalInfo.findOne({ userId: favUserId });
    const userProfileImage = await UserProfileImage.findOne({ userId: favUserId });

    const favouriteDetails = {
      userId: savedFavourite.userId,
      favouriteUserId: savedFavourite.favouriteUserId,
      fullName: userPersonalInfo?.fullName || 'Unknown',
      profileImage: userProfileImage?.profileImageUrl || null,
      location: userPersonalInfo ? `${userPersonalInfo.city}, ${userPersonalInfo.state}` : 'Unknown'
    };

    return apiResponse(res, {
      success: true,
      message: 'Favourite user saved successfully',
      data: favouriteDetails,
      statusCode: 201
    });
  } catch (error) {
    console.error(`Error in saveFavouriteUser for userId ${req.userId}:`, error);
    return apiResponse(res, {
      success: false,
      message: `Error saving favourite user: ${error.message}`,
      statusCode: 500
    });
  }
};



// Get all favorite users
const getFavouriteUsers = async (req, res) => {
  try {
    // Validate userId
    if (!mongoose.isValidObjectId(req.userId)) {
      return apiResponse(res, {
        success: false,
        message: 'Invalid user ID',
        statusCode: 400
      });
    }

    const userId = new mongoose.Types.ObjectId(req.userId);



    // Find all favorite users for the authenticated user

  const favouriteUsers = await FavouriteUser.find({ userId });

    // If no favorites found
    if (!favouriteUsers.length) {
      return apiResponse(res, {
        success: true,
        message: 'No favorite users found',
        data: [],
        statusCode: 200
      });
    }

    // Populate details for each favorite user
    const favouriteDetails = await Promise.all(
      favouriteUsers.map(async (fav) => {
        const userPersonalInfo = await UserPersonalInfo.findOne({ userId: fav.favouriteUserId });
        const userProfileImage = await UserProfileImage.findOne({ userId: fav.favouriteUserId });

        return {
          userId: fav.userId.toString(),
          favouriteUserId: fav.favouriteUserId.toString(),
          fullName: userPersonalInfo?.fullName || 'Unknown',
          profileImage: userProfileImage?.profileImageUrl || null,
          location: userPersonalInfo ? `${userPersonalInfo.city}, ${userPersonalInfo.state}` : 'Unknown',
          age: userPersonalInfo ? calculateAge(userPersonalInfo.dob) : null
        };
      })
    );

    return apiResponse(res, {
      success: true,
      message: 'Favorite users retrieved successfully',
      data: favouriteDetails,
      statusCode: 200
    });
  } catch (error) {
    console.error(`Error in getFavouriteUsers for userId ${req.userId}:`, error);
    return apiResponse(res, {
      success: false,
      message: `Error retrieving favorite users: ${error.message}`,
      statusCode: 500
    });
  }
};

module.exports = { saveFavouriteUser,getFavouriteUsers };