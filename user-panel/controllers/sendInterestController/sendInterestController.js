const UserAuth = require('../../models/userAuth/Auth');
const UserInterest = require('../../models/sendInterest/sendInterest');
const { apiResponse } = require('../../../utils/apiResponse');
const admin = require("../../../config/firebaseAdmin");
const UserPersonalInfo = require("../../models/userProfile/userPersonalinfo");
const Notification = require("../../../common/models/notification");
const mongoose = require("mongoose")

//send-Interest controller
const sendInterest = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.userId;

    // Validate input
    if (!receiverId || !mongoose.Types.ObjectId.isValid(receiverId)) {
      return apiResponse(res, {
        success: false,
        message: 'Valid Receiver ID is required',
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

    // Check if sender exists and get their personal info
    const sender = await UserAuth.findById(senderId).select('mobileNumber');
    if (!sender) {
      return apiResponse(res, {
        success: false,
        message: 'Sender not found',
        statusCode: 404
      });
    }

    const senderPersonalInfo = await UserPersonalInfo.findOne({ userId: senderId }).select('fullName');
    if (!senderPersonalInfo) {
      return apiResponse(res, {
        success: false,
        message: 'Sender personal information not found',
        statusCode: 404
      });
    }

    // Check if receiver exists and get their FCM tokens
    const receiver = await UserAuth.findById(receiverId).select('fcmToken mobileNumber');
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

    // Create notification record
    const notification = await Notification.create({
      senderId,
      receiverId,
      title: 'New Interest Received!',
      message: `${senderPersonalInfo.fullName} has shown interest in your profile.`,
      type: 'interest',
      read: false
    });

    // Send push notification to receiver if they have FCM tokens
    if (receiver.fcmToken && receiver.fcmToken.length > 0) {
      const topic = `/topics/user-${receiverId}`;

      // Subscribe receiver's FCM tokens to their topic
      try {
        await admin.messaging().subscribeToTopic(receiver.fcmToken, topic);
        console.log(`Subscribed ${receiver.fcmToken.length} tokens to topic: ${topic}`);
      } catch (subscriptionError) {
        console.error('Error subscribing to topic:', subscriptionError);

      }

      // Send notification to the topic 
      const message = {
        notification: {
          title: 'New Interest Received!',
          body: `${senderPersonalInfo.fullName} has shown interest in your profile.`,
        },
        topic: `user-${receiverId}`, // FCM automatically prepends /topics/
      };

      try {
        const response = await admin.messaging().send(message);
        console.log(`Notification sent to topic user-${receiverId}: ${response}`);

      } catch (notificationError) {
        console.error('Error sending notification:', notificationError);
        // Continue with success response even if notification fails
      }
    }

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
    console.log("userIddd", userId)

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

module.exports = { sendInterest, getInterests };