const UserReligionInfo = require('../../models/userProfile/userReligionInfo');
const { apiResponse } = require('../../utils/apiResponse'); // Import apiResponse from separate file

// Create a new user religion info
const createUserReligionInfo = async (req, res) => {
    try {
        // Check if religion info already exists for the user
        const existingInfo = await UserReligionInfo.findOne({ userId: req.userId });
        if (existingInfo) {
            return apiResponse(res, {
                success: false,
                message: 'User religion info already exists',
                statusCode: 409
            });
        }

        const userReligionInfo = new UserReligionInfo({
            ...req.body,
            userId: req.userId // Use userId from token
        });
        const savedInfo = await userReligionInfo.save();
        apiResponse(res, {
            success: true,
            data: savedInfo,
            message: 'User religion info created successfully',
            statusCode: 201
        });
    } catch (error) {
        apiResponse(res, {
            success: false,
            message: 'Error creating user religion info',
            data: error.message,
            statusCode: 400
        });
    }
};

// Get user religion info
const getUserReligionInfo = async (req, res) => {
    try {
        const userReligionInfo = await UserReligionInfo.findOne({ userId: req.userId })
        if (!userReligionInfo) {
            return apiResponse(res, {
                success: false,
                message: 'User religion info not found',
                statusCode: 404
            });
        }
        apiResponse(res, {
            success: true,
            data: userReligionInfo,
            message: 'User religion info retrieved successfully',
            statusCode: 200
        });
    } catch (error) {
        apiResponse(res, {
            success: false,
            message: 'Error retrieving user religion info',
            data: error.message,
            statusCode: 500
        });
    }
};

// Update user religion info
const updateUserReligionInfo = async (req, res) => {
    try {
        const userReligionInfo = await UserReligionInfo.findOneAndUpdate(
            { userId: req.userId },
            req.body,
            { new: true, runValidators: true }
        );
        if (!userReligionInfo) {
            return apiResponse(res, {
                success: false,
                message: 'User religion info not found',
                statusCode: 404
            });
        }
        apiResponse(res, {
            success: true,
            data: userReligionInfo,
            message: 'User religion info updated successfully',
            statusCode: 200
        });
    } catch (error) {
        apiResponse(res, {
            success: false,
            message: 'Error updating user religion info',
            data: error.message,
            statusCode: 400
        });
    }
};


// Get user religion info by ID
const getUserReligionInfoById = async (req, res) => {
  try {
    const { id } = req.params; // Get ID from route parameters


    const userReligionInfo = await UserReligionInfo.findOne({ userId: id });
    if (!userReligionInfo) {
      return apiResponse(res, {
        success: false,
        message: 'User religion info not found',
        statusCode: 404,
      });
    }

    return apiResponse(res, {
      success: true,
      data: userReligionInfo,
      message: 'User religion info retrieved successfully',
      statusCode: 200,
    });
  } catch (error) {
    return apiResponse(res, {
      success: false,
      message: 'Error retrieving user religion info',
      data: 'An unexpected error occurred',
      statusCode: 500,
    });
  }
};


module.exports = {createUserReligionInfo,getUserReligionInfo,updateUserReligionInfo,getUserReligionInfoById}

