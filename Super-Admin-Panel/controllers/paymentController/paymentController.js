const userAuth = require('../../../models/userAuth/Auth');
const { apiResponse } = require('../../../utils/apiResponse');
const { exportToCsv } = require("../../../utils/exportToCsv");

const getAllUserspaymentDetails = async (req, res) => {
    try {
        // Aggregate data from userAuth, userPersonalInfo, and userProfileImage
        const users = await userAuth.aggregate([
            // Lookup userPersonalInfo
            {
                $lookup: {
                    from: 'userpersonalinfos', // Collection name in MongoDB
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'personalInfo'
                }
            },
            // Unwind personalInfo to treat it as a single object
            { $unwind: { path: '$personalInfo', preserveNullAndEmptyArrays: true } },

            // Lookup userProfileImage
            {
                $lookup: {
                    from: 'userprofileimages', // Collection name in MongoDB
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'profileImage'
                }
            },
            // Unwind profileImage to treat it as a single object
            { $unwind: { path: '$profileImage', preserveNullAndEmptyArrays: true } },

            // Project the desired fields
            {
                $project: {
                    fullName: '$personalInfo.fullName',
                    email: '$personalInfo.emailId',
                    paymentStatus: "$paymentStatus",
                    mobileNumber: '$mobileNumber',
                    profileImage: '$profileImage.profileImageUrl',
                    planName: '$planName'
                }
            }
        ]);

        return apiResponse(res, {
            success: true,
            message: 'User details retrieved successfully',
            data: { users },
            statusCode: 200,
        });
    } catch (error) {
        console.error('Error fetching user details:', error);
        return apiResponse(res, {
            success: false,
            message: 'Internal server error',
            data: null,
            statusCode: 500,
        });
    }
};

// Controller to export user payment details to CSV
const exportToCsvController = async (req, res) => {
    try {
        // Aggregate data 
        const users = await userAuth.aggregate([
            {
                $lookup: {
                    from: 'userpersonalinfos',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'personalInfo'
                }
            },
            { $unwind: { path: '$personalInfo', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'userprofileimages',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'profileImage'
                }
            },
            { $unwind: { path: '$profileImage', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    fullName: '$personalInfo.fullName',
                    email: '$personalInfo.emailId',
                    paymentStatus: {
                        $cond: {
                            if: { $eq: ['$paymentStatus', true] },
                            then: 1,
                            else: 0
                        }
                    },
                    mobileNumber: '$mobileNumber' ,
                    profileImage: '$profileImage.profileImageUrl',
                    planName: '$planName'
                }
            }
        ]);

        // Define CSV columns
        const columns = [
            { key: 'fullName', header: 'Full Name' },
            { key: 'email', header: 'Email' },
            { key: 'paymentStatus', header: 'Payment Status' },
            { key: 'mobileNumber', header: 'Mobile Number' },
            { key: 'profileImage', header: 'Profile Image URL' },
            { key: 'planName', header: 'Plan Name' }
        ];

        // Call exportToCsv with the required arguments
        exportToCsv(res, users, columns, 'user_payment_details.csv');

    } catch (error) {
        console.error('Error exporting user details to CSV:', error);
        return apiResponse(res, {
            success: false,
            message: 'Internal server error',
            data: null,
            statusCode: 500,
        });
    }
};



module.exports = { getAllUserspaymentDetails, exportToCsvController }