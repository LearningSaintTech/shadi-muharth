const Profile = require('../../models/userProfile/userPersonalinfo');
const { apiResponse } = require('../../utils/apiResponse');
const mongoose = require('mongoose');

const likeProfile = async (req, res) => {
  try {
    const { userId } = req.body; // Get profileId from request body

    // Validate profileId
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return apiResponse(res, {
        success: false,
        message: 'Invalid or missing profileId',
        statusCode: 400,
      }); 
    }

    // Find the profile by ID
    const profile = await Profile.findOne({ userId });
    if (!profile) {
      return apiResponse(res, {
        success: false,
        message: 'Profile not found',
        statusCode: 404,
      });
    }

    // Increment LikesCount
    profile.LikesCount += 1;
    await profile.save();

    // Return success response
    return apiResponse(res, {
      success: true,
      message: 'Profile liked successfully',
      data: { LikesCount: profile.LikesCount },
      statusCode: 200,
    });
  } catch (error) {
    console.error('Error liking profile:', error);
    return apiResponse(res, {
      success: false,
      message: 'Server error',
      statusCode: 500,
    });
  }
};

const unlikeProfile = async (req, res) => {
  try {
    const { userId } = req.body; // Get userId from request body

    // Validate userId
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return apiResponse(res, {
        success: false,
        message: 'Invalid or missing userId',
        statusCode: 400,
      });
    }

    // Find the profile by userId
    const profile = await Profile.findOne({ userId });
    if (!profile) {
      return apiResponse(res, {
        success: false,
        message: 'Profile not found',
        statusCode: 404,
      });
    }

    // Decrease LikesCount, ensure it doesn't go below 0
    if (profile.LikesCount > 0) {
      profile.LikesCount -= 1;
      await profile.save();
    }

    // Return success response
    return apiResponse(res, {
      success: true,
      message: 'Profile unliked successfully',
      data: { LikesCount: profile.LikesCount },
      statusCode: 200,
    });
  } catch (error) {
    console.error('Error unliking profile:', error);
    return apiResponse(res, {
      success: false,
      message: 'Server error',
      statusCode: 500,
    });
  }
};

module.exports = { likeProfile, unlikeProfile };