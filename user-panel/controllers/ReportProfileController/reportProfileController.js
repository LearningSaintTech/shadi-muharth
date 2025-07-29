const mongoose = require('mongoose');
const UserAuth = require('../../models/userAuth/Auth');
const ReportUser = require('../../models/reportProfile/reportProfile');
const SuperAdmin = require("../../../Super-Admin-Panel/models/auth/auth");
const Notification = require("../../../common/models/notification");
const UserPersonalInfo = require("../../models/userProfile/userPersonalinfo")
const admin = require("../../../config/firebaseAdmin");
const { apiResponse } = require('../../../utils/apiResponse');


const reportUserProfile = async (req, res) => {
    try {
        const reporterId = req.userId; // Authenticated user ID
        const { reportedUserId } = req.body;

        // Validate inputs
        if (!reporterId || !reportedUserId) {
            return apiResponse(res, {
                success: false,
                message: 'Both reporter ID and reported user ID are required.',
                statusCode: 400
            });
        }

        // Prevent self-reporting
        if (reporterId.toString() === reportedUserId.toString()) {
            return apiResponse(res, {
                success: false,
                message: 'You cannot report yourself.',
                statusCode: 400
            });
        }

        // Check if both users exist and get their personal info
        const [reporter, reportedUser, reporterPersonalInfo, reportedPersonalInfo] = await Promise.all([
            UserAuth.findById(reporterId),
            UserAuth.findById(reportedUserId),
            UserPersonalInfo.findOne({ userId: reporterId }).select('fullName'),
            UserPersonalInfo.findOne({ userId: reportedUserId }).select('fullName')
        ]);

        if (!reporter || !reportedUser) {
            return apiResponse(res, {
                success: false,
                message: !reporter ? 'Reporter not found.' : 'Reported user not found.',
                statusCode: 404
            });
        }

        if (!reporterPersonalInfo || !reportedPersonalInfo) {
            return apiResponse(res, {
                success: false,
                message: !reporterPersonalInfo ? 'Reporter personal information not found.' : 'Reported user personal information not found.',
                statusCode: 404
            });
        }

        // Get super admin
        const superAdmin = await SuperAdmin.findOne({ role: 'superAdmin' }).select('_id fcmToken');
        if (!superAdmin) {
            return apiResponse(res, {
                success: false,
                message: 'Super admin not found.',
                statusCode: 404
            });
        }

        // Check if a report already exists for this reporter and reported user
        const existingReport = await ReportUser.findOne({
            reporterId,
            reportedUserId
        });

        if (existingReport) {
            return apiResponse(res, {
                success: false,
                message: 'Notification already sent for this report.',
                data: {
                    reportId: existingReport._id,
                    reportedUserId: existingReport.reportedUserId,
                    superadminId: existingReport.superadminId
                },
                statusCode: 400
            });
        }

        // Create report
        const report = await ReportUser.create({
            reporterId,
            reportedUserId,
            superadminId: superAdmin._id
        });

        // Create notification for super admin
        const notification = await Notification.create({
            senderId: reporterId,
            receiverId: superAdmin._id,
            title: 'New User Report',
            message: `${reporterPersonalInfo.fullName} reported ${reportedPersonalInfo.fullName}'s profile.`,
            type: 'report',
            read: false
        });

        // Send push notification to super admin if they have FCM tokens
        if (superAdmin.fcmToken && superAdmin.fcmToken.length > 0) {
            const topic = `/topics/admin-${superAdmin._id}`;

            // Subscribe super admin's FCM tokens to their topic
            try {
                await admin.messaging().subscribeToTopic(superAdmin.fcmToken, topic);
                console.log(`Subscribed ${superAdmin.fcmToken.length} tokens to topic: ${topic}`);
            } catch (subscriptionError) {
                console.error('Error subscribing to topic:', subscriptionError);
            }

            // Send notification to the topic
            const message = {
                notification: {
                    title: 'New User Report',
                    body: `${reporterPersonalInfo.fullName} reported ${reportedPersonalInfo.fullName}'s profile.`,
                },
                topic: `admin-${superAdmin._id}`,
            };

            try {
                const response = await admin.messaging().send(message);
                console.log(`Notification sent to topic admin-${superAdmin._id}: ${response}`);
            } catch (notificationError) {
                console.error('Error sending notification:', notificationError);
                // Continue with success response even if notification fails
            }
        }

        return apiResponse(res, {
            success: true,
            message: 'User profile reported successfully.',
            data: {
                reportId: report._id,
                reportedUserId: report.reportedUserId,
                superadminId: report.superadminId,
                notificationId: notification._id
            },
            statusCode: 201
        });

    } catch (error) {
        console.error('Error in reportUserProfile:', error);
        return apiResponse(res, {
            success: false,
            message: 'Internal server error.',
            statusCode: 500
        });
    }
};



module.exports = { reportUserProfile };
