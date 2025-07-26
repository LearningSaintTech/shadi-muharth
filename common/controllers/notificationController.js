const mongoose = require('mongoose');
const Notification = require("../models/notification");
const {apiResponse} = require("../../utils/apiResponse");

const getNotificationHistory = async (req, res) => {
  try {
    const userId = req.userId;

    // Fetch all notifications
    const notifications = await Notification.find({ receiverId: userId })
      .sort({ createdAt: -1 }) // latest first
      .select('senderId receiverId title message type read createdAt')
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
        notifications,
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


module.exports = { getNotificationHistory };