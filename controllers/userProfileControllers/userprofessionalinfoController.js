const UserProfessionalInfo = require('../../models/userProfile/userProfessionalinfo');
const { apiResponse } = require('../../utils/apiResponse'); 


// Create a new user professional info
const createUserProfessionalInfo = async (req, res) => {
    try {
        // Check if professional info already exists for the user
        const existingInfo = await UserProfessionalInfo.findOne({ userId: req.userId });
        if (existingInfo) {
            return apiResponse(res, {
                success: false,
                message: 'User professional info already exists',
                statusCode: 409
            });
        }

        const userProfessionalInfo = new UserProfessionalInfo({
            ...req.body,
            userId: req.userId // Use userId from token
        });
        const savedInfo = await userProfessionalInfo.save();
        apiResponse(res, {
            success: true,
            data: savedInfo,
            message: 'User professional info created successfully',
            statusCode: 201
        });
    } catch (error) {
        apiResponse(res, {
            success: false,
            message: 'Error creating user professional info',
            data: error.message,
            statusCode: 400
        });
    }
};

// Get user professional info
const getUserProfessionalInfo = async (req, res) => {
    try {
        const userProfessionalInfo = await UserProfessionalInfo.findOne({ userId: req.userId });
        if (!userProfessionalInfo) {
            return apiResponse(res, {
                success: false,
                message: 'User professional info not found',
                statusCode: 404
            });
        }
        apiResponse(res, {
            success: true,
            data: userProfessionalInfo,
            message: 'User professional info retrieved successfully',
            statusCode: 200
        });
    } catch (error) {
        apiResponse(res, {
            success: false,
            message: 'Error retrieving user professional info',
            data: error.message,
            statusCode: 500
        });
    }
};

// Update user professional info
const updateUserProfessionalInfo = async (req, res) => {
    try {
        const userProfessionalInfo = await UserProfessionalInfo.findOneAndUpdate(
            { userId: req.userId },
            req.body,
            { new: true, runValidators: true }
        );
        if (!userProfessionalInfo) {
            return apiResponse(res, {
                success: false,
                message: 'User professional info not found',
                statusCode: 404
            });
        }
        apiResponse(res, {
            success: true,
            data: userProfessionalInfo,
            message: 'User professional info updated successfully',
            statusCode: 200
        });
    } catch (error) {
        apiResponse(res, {
            success: false,
            message: 'Error updating user professional info',
            data: error.message,
            statusCode: 400
        });
    }
};


// Get user professional info by ID
const getUserProfessionalInfoById = async (req, res) => {
  try {
    const { id } = req.params; // Get ID from route parameters

    const userProfessionalInfo = await UserProfessionalInfo.findOne({ userId: id });
    if (!userProfessionalInfo) {
      return apiResponse(res, {
        success: false,
        message: 'User professional info not found',
        statusCode: 404,
      });
    }

    return apiResponse(res, {
      success: true,
      data: userProfessionalInfo,
      message: 'User professional info retrieved successfully',
      statusCode: 200,
    });
  } catch (error) {
    return apiResponse(res, {
      success: false,
      message: 'Error retrieving user professional info',
      data: 'An unexpected error occurred',
      statusCode: 500,
    });
  }
};

module.exports = {createUserProfessionalInfo,getUserProfessionalInfo,updateUserProfessionalInfo,getUserProfessionalInfoById}

