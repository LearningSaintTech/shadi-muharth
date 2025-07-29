const mongoose = require('mongoose');
const Notification = require("../models/notification");
const {apiResponse} = require("../../utils/apiResponse");

const getNotificationHistory = async (req, res) => {
  try {
    const userId = req.userId;

    // Fetch all notifications
    const notifications = await Notification.find({ receiverId: userId })
      .sort({ createdAt: -1 }) // latest first
      .select('_id senderId receiverId title message type read createdAt') // Added _id explicitly
      .lean();

    // Count unread notifications
    const unreadCount = await Notification.countDocuments({
      receiverId: userId,
      read: false
    });

    // total count
    const totalCount = notifications.length;

    return apiResponse(res, {
      success: true,
      message: 'Notification history fetched successfully',
      data: {
        notifications: notifications.map(notification => ({
          notificationId: notification._id, 
          ...notification
        })),
        counts: {
          total: totalCount,
          unread: unreadCount
        }
      },
      statusCode: 200
    });
  } catch (error) {
    console.error('Error fetching notification history:', error);
    return apiResponse(res, {
      success: false,
      message: 'Server error while fetching notification history',
      statusCode: 500
    });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const userId = req.userId;
    const { notificationId } = req.body;

    // Validate notificationId
    if (!notificationId || !mongoose.Types.ObjectId.isValid(notificationId)) {
      return apiResponse(res, {
        success: false,
        message: 'Invalid or missing notification ID',
        statusCode: 400
      });
    }

    // Find and delete the notification
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      receiverId: userId
    });

    // Check if notification exists and belongs to the user
    if (!notification) {
      return apiResponse(res, {
        success: false,
        message: 'Notification not found or unauthorized',
        statusCode: 404
      });
    }

    return apiResponse(res, {
      success: true,
      message: 'Notification deleted successfully',
      statusCode: 200
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return apiResponse(res, {
      success: false,
      message: 'Server error while deleting notification',
      statusCode: 500
    });
  }
};


module.exports = { getNotificationHistory,deleteNotification };