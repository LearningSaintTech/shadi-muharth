// chat.controller.js
const ChatRequest = require('../../models/chat/chatRequest');
const Chat = require('../../models/chat/chat');
const User = require('../../models/userAuth/Auth');
const UserProfileImage = require('../../models/userProfile/userProfileImage');
const UserPersonalInfo = require('../../models/userProfile/userPersonalinfo');
const { uploadImage } = require('../../../utils/s3Functions');
const { apiResponse } = require('../../../utils/apiResponse');
const Notification = require("../../../common/models/notification");
const UserAuth = require("../../models/userAuth/Auth");
const admin = require("../../../config/firebaseAdmin");
const mongoose = require('mongoose');

// Helper to generate unique conversation ID
const generateConversationId = (userId1, userId2) => {
  return [userId1.toString(), userId2.toString()].sort().join('_');
};

// Send Message Request
const sendMessageRequest = async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    const senderId = req.userId;

    if (!receiverId || !message) {
      return apiResponse(res, {
        success: false,
        message: 'Receiver ID and message are required',
        statusCode: 400
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


    // Check if request or chat already exists
    const existingRequest = await ChatRequest.findOne({
      $or: [
        { senderId, receiverId, status: { $in: ['pending', 'accepted'] } },
        { senderId: receiverId, receiverId: senderId, status: { $in: ['pending', 'accepted'] } }
      ]
    });

    if (existingRequest) {
      return apiResponse(res, {
        success: false,
        message: `A chat request or active chat already exists (status: ${existingRequest.status})`,
        statusCode: 400
      });
    }

    let mediaUrl = null;
    let mediaType = null;

    // Handle media upload if present
    if (req.files && req.files.media) {
      const file = req.files.media;
      const fileName = `chat_request_media/${senderId}_${Date.now()}_${file.originalname}`;

      if (file.mimetype.startsWith('image/')) {
        mediaType = 'image';
      } else if (file.mimetype.startsWith('video/')) {
        mediaType = 'video';
      } else if (file.mimetype.startsWith('audio/')) {
        mediaType = 'voice';
      } else {
        return apiResponse(res, {
          success: false,
          message: 'Unsupported media type',
          statusCode: 400
        });
      }

      mediaUrl = await uploadImage(file, fileName);
    }

    const chatRequest = new ChatRequest({
      senderId,
      receiverId,
      message,
      mediaUrl,
      mediaType,
      status: 'pending'
    });

    await chatRequest.save();
    // Create notification record
    const notification = await Notification.create({
      senderId,
      receiverId,
      title: 'New Message Request!',
      message: `${senderPersonalInfo.fullName} has sent you a message request.`,
      type: 'message_request',
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
      const messageNotification = {
        notification: {
          title: 'New Message Request!',
          body: `${senderPersonalInfo.fullName} has sent you a message request.`,
        },
        topic: `user-${receiverId}`,
      };

      try {
        const response = await admin.messaging().send(messageNotification);
        console.log(`Notification sent to topic user-${receiverId}: ${response}`);
      } catch (notificationError) {
        console.error('Error sending notification:', notificationError);
        // Continue with success response even if notification fails
      }
    }


    return apiResponse(res, {
      success: true,
      message: 'Message request sent successfully',
      data: chatRequest
    });
  } catch (error) {
    console.error('Error sending message request:', error);
    return apiResponse(res, {
      success: false,
      message: 'Server error while sending message request',
      statusCode: 500
    });
  }
};


// Respond to Message Request
const respondMessageRequest = async (req, res) => {
  try {
    const { requestId, status } = req.body;
    const userId = req.userId;

    if (!['accepted', 'rejected'].includes(status)) {
      return apiResponse(res, {
        success: false,
        message: 'Invalid status',
        statusCode: 400
      });
    }

    const chatRequest = await ChatRequest.findById(requestId);
    if (!chatRequest) {
      return apiResponse(res, {
        success: false,
        message: 'Message request not found',
        statusCode: 404
      });
    }

    if (chatRequest.receiverId.toString() !== userId) {
      return apiResponse(res, {
        success: false,
        message: 'Unauthorized to respond to this request',
        statusCode: 403
      });
    }

    chatRequest.status = status;
    await chatRequest.save();

    if (status === 'accepted') {
      const conversationId = generateConversationId(chatRequest.senderId, chatRequest.receiverId);
      // Check if conversation already exists to avoid duplicate conversationId error
      const existingChat = await Chat.findOne({ conversationId });
      if (!existingChat) {
        const chat = new Chat({
          conversationId,
          senderId: chatRequest.senderId,
          receiverId: chatRequest.receiverId,
          message: chatRequest.message,
          mediaUrl: chatRequest.mediaUrl,
          mediaType: chatRequest.mediaType,
          timestamp: chatRequest.createdAt,
          readStatus: true
        });
        await chat.save();
      }
    }

    return apiResponse(res, {
      success: true,
      message: `Message request ${status} successfully`,
      data: chatRequest
    });
  } catch (error) {
    console.error('Error responding to message request:', error);
    return apiResponse(res, {
      success: false,
      message: 'Server error while responding to message request',
      statusCode: 500
    });
  }
};

//send-message

const sendMessage = async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    const senderId = req.userId;
    console.log(`[sendMessage] Starting for senderId: ${senderId}, receiverId: ${receiverId}, message: ${message}`);

    // Validate inputs
    if (!receiverId || !message) {
      console.log(`[sendMessage] Missing required fields: receiverId=${receiverId}, message=${message}`);
      return apiResponse(res, {
        success: false,
        message: 'Receiver ID and message are required',
        statusCode: 400
      });
    }

    // Check if chat is allowed (accepted request exists)
    console.log(`[sendMessage] Checking for accepted chat request between senderId: ${senderId} and receiverId: ${receiverId}`);
    const chatRequest = await ChatRequest.findOne({
      $or: [
        { senderId, receiverId, status: 'accepted' },
        { senderId: receiverId, receiverId: senderId, status: 'accepted' }
      ]
    });

    if (!chatRequest) {
      console.log(`[sendMessage] No accepted chat request found for senderId: ${senderId}, receiverId: ${receiverId}`);
      return apiResponse(res, {
        success: false,
        message: 'No active chat found. Please send and get accepted a message request first',
        statusCode: 403
      });
    }
    console.log(`[sendMessage] Found accepted chat request: ${chatRequest._id}`);

    const conversationId = generateConversationId(senderId, receiverId);
    console.log(`[sendMessage] Generated conversationId: ${conversationId}`);

    let mediaUrl = null;
    let mediaType = null;

    // Handle media upload if present
    if (req.file) {
      const file = req.file;
      const fileName = `chat_media/${conversationId}_${Date.now()}_${file.originalname}`;
      console.log(`[sendMessage] Processing media upload: mimetype=${file.mimetype}, fileName=${fileName}`);
      // Extract file extension
      const extension = file.originalname.split('.').pop().toLowerCase();
      console.log(`[sendMessage] File extension: ${extension}`);

      // Handle MIME type or infer from extension
      if (file.mimetype.startsWith('image/') || ['jpg', 'jpeg', 'png', 'jfif'].includes(extension)) {
        mediaType = 'image';
      } else if (file.mimetype.startsWith('video/') || ['mp4', 'mov', 'avi'].includes(extension)) {
        mediaType = 'video';
      } else if (file.mimetype.startsWith('audio/') || ['mp3', 'wav', 'ogg'].includes(extension)) {
        mediaType = 'voice';
      } else {
        console.log(`[sendMessage] Unsupported media type: mimetype=${file.mimetype}, extension=${extension}`);
        return apiResponse(res, {
          success: false,
          message: `Unsupported media type: ${file.mimetype} (extension: ${extension})`,
          statusCode: 400
        });
      }
      console.log(`[sendMessage] Determined mediaType: ${mediaType}`);


      mediaUrl = await uploadImage(file, fileName);
      console.log(`[sendMessage] Media uploaded successfully: mediaUrl=${mediaUrl}, mediaType=${mediaType}`);
    } else {
      console.log(`[sendMessage] No media provided`);
    }

    const chat = new Chat({
      conversationId,
      senderId,
      receiverId,
      message,
      mediaUrl,
      mediaType,
      timestamp: new Date(),
      readStatus: false
    });
    console.log(`[sendMessage] Created new Chat document: ${JSON.stringify(chat.toObject())}`);

    await chat.save();
    console.log(`[sendMessage] Chat message saved successfully: messageId=${chat._id}`);

    return apiResponse(res, {
      success: true,
      message: 'Message sent successfully',
      data: chat
    });
  } catch (error) {
    console.error(`[sendMessage] Error sending message for senderId: ${req.userId || 'unknown'}:`, error);
    return apiResponse(res, {
      success: false,
      message: 'Server error while sending message',
      statusCode: 500
    });
  }
};



// Get Chat List
const getChatList = async (req, res) => {
  try {
    const userId = req.userId;

    // Get all conversations where user is either sender or receiver
    const conversations = await Chat.aggregate([
      {
        $match: {
          $or: [
            { senderId: new mongoose.Types.ObjectId(userId) },
            { receiverId: new mongoose.Types.ObjectId(userId) }
          ]
        }
      },
      {
        $sort: { timestamp: -1 }
      },
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $first: '$message' },
          mediaType: { $first: '$mediaType' },
          timestamp: { $first: '$timestamp' },
          senderId: { $first: '$senderId' },
          receiverId: { $first: '$receiverId' },
          readStatus: { $first: '$readStatus' }
        }
      },
      {
        $lookup: {
          from: 'userauths',
          let: {
            otherUserId: {
              $cond: [
                { $eq: ['$senderId', new mongoose.Types.ObjectId(userId)] },
                '$receiverId',
                '$senderId'
              ]
            }
          },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$otherUserId'] } } },
            { $project: { _id: 1 } }
          ],
          as: 'otherUser'
        }
      },
      { $unwind: '$otherUser' },
      {
        $lookup: {
          from: 'userpersonalinfos',
          localField: 'otherUser._id',
          foreignField: 'userId',
          as: 'personalInfo'
        }
      },
      { $unwind: '$personalInfo' },
      {
        $lookup: {
          from: 'userprofileimages',
          localField: 'otherUser._id',
          foreignField: 'userId',
          as: 'profileImage'
        }
      },
      {
        $unwind: {
          path: '$profileImage',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          conversationId: '$_id',
          otherUserId: '$otherUser._id',
          otherUserName: '$personalInfo.fullName',
          otherUserPhoto: '$profileImage.profileImageUrl',
          lastMessage: 1,
          mediaType: 1,
          timestamp: 1,
          readStatus: 1
        }
      },
      { $sort: { timestamp: -1 } }
    ]);

    // Get pending message requests
    const pendingRequests = await ChatRequest.find({
      receiverId: userId,
      status: 'pending'
    })
      .populate({
        path: 'senderId',
        select: '_id'
      })
      .lean();

    // Add personal info and profile image for pending requests
    for (let request of pendingRequests) {
      const personalInfo = await UserPersonalInfo.findOne({ userId: request.senderId._id }).lean();
      const profileImage = await UserProfileImage.findOne({ userId: request.senderId._id }).lean();
      request.sender = {
        userId: request.senderId._id,
        fullName: personalInfo ? personalInfo.fullName : null,
        profileImageUrl: profileImage ? profileImage.profileImageUrl : null
      };
      delete request.senderId;
    }

    return apiResponse(res, {
      success: true,
      message: 'Chat list and pending requests retrieved successfully',
      data: {
        conversations,
        pendingRequests
      }
    });
  } catch (error) {
    console.error('Error fetching chat list:', error);
    return apiResponse(res, {
      success: false,
      message: 'Server error while fetching chat list',
      statusCode: 500
    });
  }
};


// Get Chat Messages
const getChatMessages = async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const userId = req.userId;

    // Validate other user exists
    const otherUser = await User.findById(otherUserId);
    if (!otherUser) {
      return apiResponse(res, {
        success: false,
        message: 'Other user not found',
        statusCode: 404
      });
    }

    const conversationId = generateConversationId(userId, otherUserId);

    // Verify chat exists and is accepted
    const chatRequest = await ChatRequest.findOne({
      $or: [
        { senderId: userId, receiverId: otherUserId, status: 'accepted' },
        { senderId: otherUserId, receiverId: userId, status: 'accepted' }
      ]
    });

    if (!chatRequest) {
      return apiResponse(res, {
        success: false,
        message: 'No active chat found',
        statusCode: 403
      });
    }

    // Update readStatus for messages where the current user is the receiver
    const updateResult = await Chat.updateMany(
      {
        conversationId,
        receiverId: new mongoose.Types.ObjectId(userId),
        readStatus: false
      },
      { $set: { readStatus: true } }
    );
    console.log(`[getChatMessages] Updated ${updateResult.modifiedCount} messages to readStatus: true for user ${userId} in conversation ${conversationId}`);

    // Get all messages in chronological order
    const messages = await Chat.find({ conversationId })
      .sort({ timestamp: 1 }) // Earliest first
      .populate({
        path: 'senderId',
        select: '_id'
      })
      .populate({
        path: 'receiverId',
        select: '_id'
      })
      .lean();

    // Add receiver name, sender/receiver profile photos, IDs, and isSender flag
    const formattedMessages = [];
    for (let message of messages) {
      const senderProfileImage = await UserProfileImage.findOne({ userId: message.senderId._id }).lean();
      const receiverPersonalInfo = await UserPersonalInfo.findOne({ userId: message.receiverId._id }).lean();
      const receiverProfileImage = await UserProfileImage.findOne({ userId: message.receiverId._id }).lean();

      formattedMessages.push({
        messageId: message._id,
        senderId: message.senderId._id,
        receiverId: message.receiverId._id,
        receiverName: receiverPersonalInfo ? receiverPersonalInfo.fullName : null,
        senderProfilePhoto: senderProfileImage ? senderProfileImage.profileImageUrl : null,
        receiverProfilePhoto: receiverProfileImage ? receiverProfileImage.profileImageUrl : null,
        message: message.message,
        mediaUrl: message.mediaUrl,
        mediaType: message.mediaType,
        timestamp: message.timestamp,
        readStatus: message.readStatus,
        isSender: message.senderId._id.toString() === userId
      });
    }

    return apiResponse(res, {
      success: true,
      message: 'Chat history retrieved successfully',
      data: {
        conversationId,
        messages: formattedMessages
      }
    });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return apiResponse(res, {
      success: false,
      message: 'Server error while fetching chat history',
      statusCode: 500
    });
  }
};



// Search Chats by Name
const searchChatsByName = async (req, res) => {
  try {
    const { name } = req.query;
    const userId = req.userId;
    console.log(`[searchChatsByName] Starting for userId: ${userId}, search name: ${name}`);

    // Validate input
    if (!name || typeof name !== 'string' || name.trim() === '') {
      console.log(`[searchChatsByName] Invalid or missing name parameter: ${name}`);
      return apiResponse(res, {
        success: false,
        message: 'Name query parameter is required',
        statusCode: 400
      });
    }

    // Find accepted chat requests involving the current user
    console.log(`[searchChatsByName] Fetching accepted chat requests for userId: ${userId}`);
    const chatRequests = await ChatRequest.find({
      $or: [
        { senderId: userId, status: 'accepted' },
        { receiverId: userId, status: 'accepted' }
      ]
    }).lean();
    console.log(`[searchChatsByName] Found ${chatRequests.length} accepted chat requests`);

    // Extract other user IDs from chat requests
    const otherUserIds = chatRequests.map(request =>
      request.senderId.toString() === userId ? request.receiverId.toString() : request.senderId.toString()
    );
    console.log(`[searchChatsByName] Other user IDs: ${otherUserIds.join(', ')}`);

    // Find users whose names match the search term
    console.log(`[searchChatsByName] Searching UserPersonalInfo for name: ${name}`);
    const matchingUsers = await UserPersonalInfo.find({
      userId: { $in: otherUserIds.map(id => new mongoose.Types.ObjectId(id)) },
      fullName: { $regex: name.trim(), $options: 'i' }
    }).lean();
    console.log(`[searchChatsByName] Found ${matchingUsers.length} matching users`);

    const matchingUserIds = matchingUsers.map(user => user.userId.toString());
    console.log(`[searchChatsByName] Matching user IDs: ${matchingUserIds.join(', ')}`);

    // Generate conversation IDs for matching users
    const conversationIds = matchingUserIds.map(otherUserId =>
      generateConversationId(userId, otherUserId)
    );
    console.log(`[searchChatsByName] Generated conversationIds: ${conversationIds.join(', ')}`);

    // Fetch the latest message for each conversation
    const chatList = [];
    for (const conversationId of conversationIds) {
      console.log(`[searchChatsByName] Fetching latest message for conversationId: ${conversationId}`);
      const latestMessage = await Chat.findOne({ conversationId })
        .sort({ timestamp: -1 }) // Most recent first
        .populate({
          path: 'senderId',
          select: '_id'
        })
        .populate({
          path: 'receiverId',
          select: '_id'
        })
        .lean();

      if (latestMessage) {
        const otherUserId = latestMessage.senderId._id.toString() === userId
          ? latestMessage.receiverId._id.toString()
          : latestMessage.senderId._id.toString();

        const otherUserInfo = matchingUsers.find(user => user.userId.toString() === otherUserId);
        const otherUserProfileImage = await UserProfileImage.findOne({ userId: otherUserId }).lean();

        chatList.push({
          conversationId,
          otherUserId,
          otherUserName: otherUserInfo ? otherUserInfo.fullName : null,
          otherUserProfilePhoto: otherUserProfileImage ? otherUserProfileImage.profileImageUrl : null,
          lastMessage: {
            messageId: latestMessage._id,
            message: latestMessage.message,
            mediaUrl: latestMessage.mediaUrl,
            mediaType: latestMessage.mediaType,
            timestamp: latestMessage.timestamp,
            readStatus: latestMessage.readStatus,
            isSender: latestMessage.senderId._id.toString() === userId
          }
        });
        console.log(`[searchChatsByName] Added chat to list: conversationId=${conversationId}, otherUserId=${otherUserId}`);
      } else {
        console.log(`[searchChatsByName] No messages found for conversationId: ${conversationId}`);
      }
    }

    // Sort chats by last message timestamp (most recent first)
    chatList.sort((a, b) => new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp));
    console.log(`[searchChatsByName] Returning ${chatList.length} chats, sorted by timestamp`);

    return apiResponse(res, {
      success: true,
      message: 'Chats retrieved successfully',
      data: {
        chats: chatList
      }
    });
  } catch (error) {
    console.error(`[searchChatsByName] Error for userId: ${req.userId || 'unknown'}:`, error);
    return apiResponse(res, {
      success: false,
      message: 'Server error while searching chats',
      statusCode: 500
    });
  }
};

module.exports = { sendMessageRequest, respondMessageRequest, sendMessage, getChatList, getChatMessages, searchChatsByName }