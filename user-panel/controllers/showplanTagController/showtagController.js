const mongoose = require('mongoose');
const UserAuth = require('../../models/userAuth/Auth');
const { apiResponse } = require('../../../utils/apiResponse');

const showTag = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("11",userId);

    // Find user
    const user = await UserAuth.findById(userId).select('planName');
    if (!user) {
      return apiResponse(res, {
        success: false,
        message: 'User not found',
        statusCode: 404
      });
    }

    // Prepare response data
    const responseData = {
      userId: user._id.toString(),
      planName: user.planName
    };

    return apiResponse(res, {
      success: true,
      message: 'Plan tag retrieved successfully',
      data: responseData,
      statusCode: 200
    });
  } catch (error) {
    console.error('Error fetching plan tag:', error);
    return apiResponse(res, {
      success: false,
      message: 'Internal server error',
      statusCode: 500
    });
  }
};

module.exports = { showTag };