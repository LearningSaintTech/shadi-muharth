const UserAuth = require('../../models/userAuth/Auth');
const ProfileVerification = require('../../models/sendVerification/sendVerification');
const { apiResponse } = require('../../utils/apiResponse');

const sendVerificationOnly = async (req, res) => {
  try {
    const { receiverId } = req.body; // User to verify
    const senderId = req.userId; 

    // Validate input
    if (!receiverId) {
      return apiResponse(res, {
        success: false,
        message: 'Receiver ID is required',
        statusCode: 400
      });
    }

    // Prevent verifying own profile
    if (senderId === receiverId) {
      return apiResponse(res, {
        success: false,
        message: 'Cannot verify your own profile',
        statusCode: 400
      });
    }

    // Check if sender exists and has a complete profile
    const sender = await UserAuth.findById(senderId);
    if (!sender) {
      return apiResponse(res, {
        success: false,
        message: 'Sender not found',
        statusCode: 404
      });
    }

    // Check if receiver exists
    const receiver = await UserAuth.findById(receiverId);
    if (!receiver) {
      return apiResponse(res, {
        success: false,
        message: 'Receiver not found',
        statusCode: 404
      });
    }

    // Check if verification record already exists
    const existingVerification = await ProfileVerification.findOne({ senderId, receiverId });
    if (existingVerification) {
      return apiResponse(res, {
        success: false,
        message: 'verification already sent',
        statusCode: 400
      });
    }

    // Set receiver's profile as complete
    receiver.isProfileComplete = true;
    await receiver.save();

    // Create verification record
    const verification = await ProfileVerification.create({
      senderId,
      receiverId
    });

    return apiResponse(res, {
      success: true,
      message: 'verification sent successfully',
      data: {
        verification: {
          id: verification._id,
          senderId: verification.senderId,
          receiverId: verification.receiverId,
          createdAt: verification.createdAt
        }
      },
      statusCode: 200
    });
  } catch (error) {
    console.error('Profile verification error:', error);
    return apiResponse(res, {
      success: false,
      message: 'Server error while verifying profile',
      statusCode: 500
    });
  }
};


const getVerifications = async (req, res) => {
  try {
    const userId = req.userId; 
    const user = await UserAuth.findById(userId);
    if (!user) {
      return apiResponse(res, {
        success: false,
        message: 'User not found',
        statusCode: 404
      });
    }

    // Fetch verifications received by the user
    const receivedVerifications = await ProfileVerification.find({ receiverId: userId })
      .populate('senderId')
      .sort({ createdAt: -1 }) // Sort by newest first
      .lean();

    return apiResponse(res, {
      success: true,
      message: 'Received verifications retrieved successfully',
      data: {
        receivedVerifications: receivedVerifications.map(verification => ({
          id: verification._id,
          senderId: verification.senderId._id,
          createdAt: verification.createdAt
        }))
      },
      statusCode: 200
    });
  } catch (error) {
    console.error('Get received verifications error:', error);
    return apiResponse(res, {
      success: false,
      message: 'Server error while retrieving received verifications',
      statusCode: 500
    });
  }
};

module.exports = { sendVerificationOnly,getVerifications };