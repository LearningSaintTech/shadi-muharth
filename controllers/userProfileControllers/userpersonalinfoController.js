const UserPersonalInfo = require('../../models/userProfile/userPersonalinfo');
const UserProfileImage = require("../../models/userProfile/userProfileImage");
const { apiResponse } = require('../../utils/apiResponse');
const mongoose = require("mongoose");

// Create a new user personal info
const createUserPersonalInfo = async (req, res) => {
    try {
        // Check if personal info already exists for the user
        const existingInfo = await UserPersonalInfo.findOne({ userId: req.userId });
        if (existingInfo) {
            return apiResponse(res, {
                success: false,
                message: 'User personal info already exists',
                statusCode: 409 
            });
        }

        const userPersonalInfo = new UserPersonalInfo({
            ...req.body,
            userId: req.userId // Use userId from token
        });
        console.log("personalInfo",userPersonalInfo)
        const savedInfo = await userPersonalInfo.save();
        apiResponse(res, {
            success: true,
            data: savedInfo,
            message: 'User personal info created successfully',
            statusCode: 201
        });
    } catch (error) {
        apiResponse(res, {
            success: false,
            message: 'Error creating user personal info',
            data: error.message,
            statusCode: 400
        });
    }
};

// Get user personal info
const getUserPersonalInfo = async (req, res) => {
    try {
        const userPersonalInfo = await UserPersonalInfo.findOne({ userId: req.userId })
        if (!userPersonalInfo) {
            return apiResponse(res, {
                success: false,
                message: 'User personal info not found',
                statusCode: 404
            });
        }
        apiResponse(res, {
            success: true,
            data: userPersonalInfo,
            message: 'User personal info retrieved successfully',
            statusCode: 200
        });
    } catch (error) {
        apiResponse(res, {
            success: false,
            message: 'Error retrieving user personal info',
            data: error.message,
            statusCode: 500
        });
    }
};

// Update user personal info
const updateUserPersonalInfo = async (req, res) => {
    try {
        const userPersonalInfo = await UserPersonalInfo.findOneAndUpdate(
            { userId: req.userId },
            req.body,
            { new: true, runValidators: true }
        );
        if (!userPersonalInfo) {
            return apiResponse(res, {
                success: false,
                message: 'User personal info not found',
                statusCode: 404
            });
        }
        apiResponse(res, {
            success: true,
            data: userPersonalInfo,
            message: 'User personal info updated successfully',
            statusCode: 200
        });
    } catch (error) {
        apiResponse(res, {
            success: false,
            message: 'Error updating user personal info',
            data: error.message,
            statusCode: 400
        });
    }
};



// Get user profile summary (fullName, profileImage, combined location)
const getUserProfileSummary = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.userId)) {
      return apiResponse(res, {
        success: false,
        message: 'Invalid user ID',
        statusCode: 400
      });
    }

    const userId = new mongoose.Types.ObjectId(req.userId);

    const userPersonalInfo = await UserPersonalInfo.findOne({ userId });
    if (!userPersonalInfo) {
      return apiResponse(res, {
        success: false,
        message: 'User personal info not found',
        statusCode: 404
      });
    }

    const userProfileImage = await UserProfileImage.findOne({ userId });

    const profileSummary = {
      fullName: userPersonalInfo.fullName,
      profileImage: userProfileImage?.profileImageUrl || null,
      location: `${userPersonalInfo.city}, ${userPersonalInfo.state}, ${userPersonalInfo.country}`
    };

    return apiResponse(res, {
      success: true,
      message: 'User profile summary retrieved successfully',
      data: profileSummary,
      statusCode: 200
    });
  } catch (error) {
    console.error(`Error in getUserProfileSummary for userId ${req.userId}:`, error);
    return apiResponse(res, {
      success: false,
      message: `Error retrieving user profile summary: ${error.message}`,
      statusCode: 500
    });
  }
};


//get by id 
const getUserPersonalInfoById = async (req, res) => {
  try {
    const { id } = req.params; 

    const userPersonalInfo = await UserPersonalInfo.findOne({ userId: id });
    if (!userPersonalInfo) {
      return apiResponse(res, {
        success: false,
        message: 'User personal info not found',
        statusCode: 404,
      });
    }

    return apiResponse(res, {
      success: true,
      data: userPersonalInfo,
      message: 'User personal info retrieved successfully',
      statusCode: 200,
    });
  } catch (error) {
    return apiResponse(res, {
      success: false,
      message: 'Error retrieving user personal info',
      data: 'An unexpected error occurred',
      statusCode: 500,
    });
  }
};

module.exports = { createUserPersonalInfo, getUserPersonalInfo, updateUserPersonalInfo ,getUserProfileSummary,getUserPersonalInfoById};