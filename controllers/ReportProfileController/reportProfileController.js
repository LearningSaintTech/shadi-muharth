const UserAuth = require('../../models/userAuth/Auth');
const ReportUser = require('../../models/reportProfile/reportProfile');
const { apiResponse } = require('../../utils/apiResponse');

// Controller to report a user profile
const reportUserProfile = async (req, res) => {
    try {
        const reporterId = req.userId; // ID of the user reporting
        const { reportedUserId } = req.body;

        // Validate reporterId
        if (!reporterId) {
            console.log('No reporterId provided');
            return apiResponse(res, { 
                success: false,
                message: 'Reporter ID is required',
                statusCode: 400
            });
        }

        // Check if reporter exists
        const reporter = await UserAuth.findById(reporterId);
        if (!reporter) {
            console.log('Reporter not found with ID:', reporterId);
            return apiResponse(res, {
                success: false,
                message: 'Reporter not found',
                statusCode: 404
            });
        }

        // Check if reported user exists
        const reportedUser = await UserAuth.findById(reportedUserId);
        if (!reportedUser) {
            console.log('Reported user not found with ID:', reportedUserId);
            return apiResponse(res, {
                success: false,
                message: 'Reported user not found',
                statusCode: 404
            });
        }

        // Prevent self-reporting
        if (reporterId.toString() === reportedUserId.toString()) {
            console.log('User attempted to report themselves:', reporterId);
            return apiResponse(res, {
                success: false,
                message: 'You cannot report yourself',
                statusCode: 400
            });
        }

        // Hardcoded admin ID
        const adminId = '66f7c3b1a2d3e4f5c6b7a8d9';

        // Create report in the database
        const report = await ReportUser.create({
            reporterId,
            reportedUserId,
            adminId
        });

        console.log('User profile report created:', {
            reportId: report._id,
            reporterId,
            reportedUserId,
            adminId
        });

        return apiResponse(res, {
            success: true,
            message: 'User profile reported successfully',
            data: {
                reportId: report._id,
                reportedUserId,
                adminId,
            },
            statusCode: 201
        });
    } catch (error) {
        console.error('Error reporting user profile:', error);
        return apiResponse(res, {
            success: false,
            message: 'Internal server error',
            statusCode: 500
        });
    }
};

module.exports = { reportUserProfile };