const userAuth = require("../../../user-panel/models/userAuth/Auth");
const {apiResponse} = require("../../../utils/apiResponse");

// Controller to get total user count
const getUserCount = async (req, res) => {
  try {
    const totalUsers = await userAuth.countDocuments();
    return apiResponse(res, {
      success: true,
      message: 'User count retrieved successfully',
      data: { totalUsers },
      statusCode: 200,
    });
  } catch (error) {
    console.error('Error fetching user count:', error);
    return apiResponse(res, {
      success: false,
      message: 'Internal server error',
      data: null,
      statusCode: 500,
    });
  }
};


const getSubscribedUserCount = async (req, res) => {
  try {
    const subscribedUsers = await userAuth.countDocuments({
      planName: { $in: ['Silver', 'Gold'] }
    });
    return apiResponse(res, {
      success: true,
      message: 'Subscribed user count retrieved successfully',
      data: { subscribedUsers },
      statusCode: 200,
    });
  } catch (error) {
    console.error('Error fetching subscribed user count:', error);
    return apiResponse(res, {
      success: false,
      message: 'Internal server error',
      data: null,
      statusCode: 500,
    });
  }
};

const getGoldUserCount = async (req, res) => {
  try {
    const goldUsers = await userAuth.countDocuments({ planName: 'Gold' });
    return apiResponse(res, {
      success: true,
      message: 'Gold user count retrieved successfully',
      data: { goldUsers },
      statusCode: 200,
    });
  } catch (error) {
    console.error('Error fetching Gold user count:', error);
    return apiResponse(res, {
      success: false,
      message: 'Internal server error',
      data: null,
      statusCode: 500,
    });
  }
};


const getSilverUserCount = async (req, res) => {
  try {
    const silverUsers = await userAuth.countDocuments({ planName: 'Silver' });
    return apiResponse(res, {
      success: true,
      message: 'Silver user count retrieved successfully',
      data: { silverUsers },
      statusCode: 200,
    });
  } catch (error) {
    console.error('Error fetching Silver user count:', error);
    return apiResponse(res, {
      success: false,
      message: 'Internal server error',
      data: null,
      statusCode: 500,
    });
  }
};

module.exports = {getUserCount,getSubscribedUserCount,getGoldUserCount,getSilverUserCount}