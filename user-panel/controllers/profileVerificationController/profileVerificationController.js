const UserAuth = require('../../models/userAuth/Auth');
const ProfileVerification = require('../../models/sendVerification/sendVerification');
const { apiResponse } = require('../../../utils/apiResponse');
const mongoose = require("mongoose");

const sendVerificationOnly = async (req, res) => {
  try {
    const { receiverId, isdocumentsUploaded = false } = req.body; // Allow isdocumentsUploaded in request body
    const senderId = req.userId;

    // Validate input
    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return apiResponse(res, {
        success: false,
        message: 'Invalid receiver ID',
        statusCode: 400
      });
    }

    // Prevent self-verification
    if (senderId === receiverId) {
      return apiResponse(res, {
        success: false,
        message: 'Cannot verify your own profile',
        statusCode: 400
      });
    }

    // Check if sender exists
    const sender = await mongoose.model('UserAuth').findById(senderId);
    if (!sender) {
      return apiResponse(res, {
        success: false,
        message: 'Sender not found',
        statusCode: 404
      });
    }

    // Check if receiver exists
    const receiver = await mongoose.model('UserAuth').findById(receiverId);
    if (!receiver) {
      return apiResponse(res, {
        success: false,
        message: 'Receiver not found',
        statusCode: 404
      });
    }

    // Check for existing verification
    const existingVerification = await ProfileVerification.findOne({ 
      senderId, 
      receiverId 
    });
    if (existingVerification) {
      return apiResponse(res, {
        success: false,
        message: 'Verification already sent',
        statusCode: 400
      });
    }

    // Set receiver_status based on isdocumentsUploaded
    const receiverStatus = isdocumentsUploaded ? "document uploaded" : "upload documents";

    // Create new verification record
    const verification = await ProfileVerification.create({
      senderId,
      receiverId,
      isdocumentsUploaded,
      receiver_status: receiverStatus
    });

    // Update receiver's profile status
    receiver.isProfileComplete = true;
    await receiver.save();

    return apiResponse(res, {
      success: true,
      message: 'Verification request sent successfully',
      data: {
        verification: {
          id: verification._id,
          senderId: verification.senderId,
          receiverId: verification.receiverId,
          status: verification.receiver_status,
          isdocumentsUploaded: verification.isdocumentsUploaded,
          createdAt: verification.createdAt
        }
      },
      statusCode: 201
    });

  } catch (error) {
    console.error('Profile verification error:', error);
    return apiResponse(res, {
      success: false,
      message: 'Server error while processing verification request',
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

module.exports = { sendVerificationOnly, getVerifications };