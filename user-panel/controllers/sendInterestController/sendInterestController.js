const UserAuth = require('../../models/userAuth/Auth');
const UserInterest = require('../../models/sendInterest/sendInterest'); 
const { apiResponse } = require('../../../utils/apiResponse');

//send-Interest controller
const sendInterest = async (req, res) => {
  try {
    const { receiverId } = req.body; 
    const senderId = req.userId; 

    // Validate input
    if (!receiverId) {
      return apiResponse(res, {
        success: false,
        message: 'Receiver ID is required',
        statusCode: 400
      });
    }

    if (senderId === receiverId) {
      return apiResponse(res, {
        success: false,
        message: 'Cannot send interest to yourself',
        statusCode: 400
      });
    }

    const sender = await UserAuth.findById(senderId);
    if (!sender) {
      return apiResponse(res, {
        success: false,
        message: 'Sender not found',
        statusCode: 404
      });
    };

    // Check if receiver exists
    const receiver = await UserAuth.findById(receiverId);
    if (!receiver) {
      return apiResponse(res, {
        success: false,
        message: 'Receiver not found',
        statusCode: 404
      });
    }

    // Check if interest already exists
    const existingInterest = await UserInterest.findOne({ senderId, receiverId });
    if (existingInterest) {
      return apiResponse(res, {
        success: false,
        message: 'Interest already sent to this user',
        statusCode: 400
      });
    }

    // Create new interest record
    const interest = await UserInterest.create({
      senderId,
      receiverId
    });

    return apiResponse(res, {
      success: true,
      message: 'Interest sent successfully',
      data: {
        interest: {
          id: interest._id,
          senderId: interest.senderId,
          receiverId: interest.receiverId,
          createdAt: interest.createdAt
        }
      },
      statusCode: 200
    });
  } catch (error) {
    console.error('Send interest error:', error);
    return apiResponse(res, {
      success: false,
      message: 'Server error while sending interest',
      statusCode: 500
    });
  }
};

//get-Interest controller
const getInterests = async (req, res) => {
  try {
    const userId = req.userId;
    console.log("userIddd",userId)

    // Check if user exists and has a complete profile
    const user = await UserAuth.findById(userId);
    if (!user) {
      return apiResponse(res, {
        success: false,
        message: 'User not found',
        statusCode: 404
      });
    }

    // Fetch interests received by the user
    const receivedInterests = await UserInterest.find({ receiverId: userId })
      .populate('senderId')
      .sort({ createdAt: -1 })
      .lean();

    return apiResponse(res, {
      success: true,
      message: 'Received interests retrieved successfully',
      data: {
        receivedInterests: receivedInterests.map(interest => ({
          id: interest._id,
          senderId: interest.senderId._id,
          createdAt: interest.createdAt
        }))
      },
      statusCode: 200
    });
  } catch (error) {
    console.error('Get received interests error:', error);
    return apiResponse(res, {
      success: false,
      message: 'Server error while retrieving received interests',
      statusCode: 500
    });
  }
};

module.exports = { sendInterest,getInterests };