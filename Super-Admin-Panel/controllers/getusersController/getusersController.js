const userAuth = require('../../../user-panel/models/userAuth/Auth');
const { apiResponse } = require('../../../utils/apiResponse');
const { exportToCsv } = require("../../../utils/exportToCsv");
const mongoose = require('mongoose')

const getAllUsersDetails = async (req, res) => {
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
                    address: {
                        $concat: [
                            { $ifNull: ['$personalInfo.block', ''] },
                            {
                                $cond: [
                                    {
                                        $and: [
                                            { $ne: ['$personalInfo.block', ''] },
                                            { $ne: ['$personalInfo.district', ''] }
                                        ]
                                    }, ', ', ''
                                ]
                            },
                            { $ifNull: ['$personalInfo.district', ''] },
                            {
                                $cond: [
                                    {
                                        $and: [
                                            { $ne: ['$personalInfo.district', ''] },
                                            { $ne: ['$personalInfo.city', ''] }
                                        ]
                                    }, ', ', ''
                                ]
                            },
                            { $ifNull: ['$personalInfo.city', ''] },
                            {
                                $cond: [
                                    {
                                        $and: [
                                            { $ne: ['$personalInfo.city', ''] },
                                            { $ne: ['$personalInfo.state', ''] }
                                        ]
                                    }, ', ', ''
                                ]
                            },
                            { $ifNull: ['$personalInfo.state', ''] }
                        ]
                    },
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


// Controller to export user details to CSV
const exportUsersToCsv = async (req, res) => {
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
                    address: {
                        $concat: [
                            { $ifNull: ['$personalInfo.block', ''] },
                            {
                                $cond: [
                                    {
                                        $and: [
                                            { $ne: ['$personalInfo.block', ''] },
                                            { $ne: ['$personalInfo.district', ''] }
                                        ]
                                    }, ', ', ''
                                ]
                            },
                            { $ifNull: ['$personalInfo.district', ''] },
                            {
                                $cond: [
                                    {
                                        $and: [
                                            { $ne: ['$personalInfo.district', ''] },
                                            { $ne: ['$personalInfo.city', ''] }
                                        ]
                                    }, ', ', ''
                                ]
                            },
                            { $ifNull: ['$personalInfo.city', ''] },
                            {
                                $cond: [
                                    {
                                        $and: [
                                            { $ne: ['$personalInfo.city', ''] },
                                            { $ne: ['$personalInfo.state', ''] }
                                        ]
                                    }, ', ', ''
                                ]
                            },
                            { $ifNull: ['$personalInfo.state', ''] }
                        ]
                    },
                    mobileNumber: {
                        $concat: ['"', { $toString: '$mobileNumber' }, '"']
                    },
                    profileImage: '$profileImage.profileImageUrl',
                    planName: '$planName'
                }
            }
        ]);

        // Define CSV columns
        const columns = [
            { key: 'fullName', header: 'Full Name' },
            { key: 'email', header: 'Email' },
            { key: 'address', header: 'Address' },
            { key: 'mobileNumber', header: 'Mobile Number' },
            { key: 'profileImage', header: 'Profile Image' },
            { key: 'planName', header: 'Plan Name' }
        ];

        exportToCsv(res, users, columns, 'users_export.csv');

    } catch (error) {
        console.error('Error exporting users to CSV:', error);
        return apiResponse(res, {
            success: false,
            message: 'Internal server error',
            data: null,
            statusCode: 500,
        });
    }
};



const getUserById = async (req, res) => {
    try {
        const { id } = req.params; // Assuming the user ID is passed as a URL parameter

        // Validate the ID
        if (!id) {
            return apiResponse(res, {
                success: false,
                message: 'User ID is required',
                data: null,
                statusCode: 400,
            });
        }

        // Aggregate data from userAuth, userPersonalInfo, userProfessionalInfo, userReligiousInfo, and userProfileImage
        const users = await userAuth.aggregate([
            // Match the specific user by ID
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(id)
                }
            },
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
            {
                $unwind: { path: '$personalInfo', preserveNullAndEmptyArrays: true }
            },
            // Lookup userProfessionalInfo
            {
                $lookup: {
                    from: 'userprofessionalinfos', // Collection name in MongoDB
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'professionalInfo'
                }
            },
            // Unwind professionalInfo
            {
                $unwind: { path: '$professionalInfo', preserveNullAndEmptyArrays: true }
            },
            // Lookup userReligiousInfo
            {
                $lookup: {
                    from: 'userreligioninfos', // Collection name in MongoDB
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'religiousInfo'
                }
            },
            // Unwind religiousInfo
            {
                $unwind: { path: '$religiousInfo', preserveNullAndEmptyArrays: true }
            },
            // Lookup userProfileImage
            {
                $lookup: {
                    from: 'userprofileimages', // Collection name in MongoDB
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'profileImage'
                }
            },
            // Unwind profileImage
            {
                $unwind: { path: '$profileImage', preserveNullAndEmptyArrays: true }
            },
            // Project the desired fields
            {
                $project: {
                    _id: 1,
                    fullName: '$personalInfo.fullName',
                    email: '$personalInfo.emailId',
                    mobileNumber: {
                        $ifNull: [
                            { $concat: ['"', { $toString: '$mobileNumber' }, '"'] },
                            'N/A'
                        ]
                    },
                    address: {
                        $concat: [
                            { $ifNull: ['$personalInfo.block', ''] },
                            {
                                $cond: [
                                    {
                                        $and: [
                                            { $ne: ['$personalInfo.block', ''] },
                                            { $ne: ['$personalInfo.district', ''] }
                                        ]
                                    }, ', ', ''
                                ]
                            },
                            { $ifNull: ['$personalInfo.district', ''] },
                            {
                                $cond: [
                                    {
                                        $and: [
                                            { $ne: ['$personalInfo.district', ''] },
                                            { $ne: ['$personalInfo.city', ''] }
                                        ]
                                    }, ', ', ''
                                ]
                            },
                            { $ifNull: ['$personalInfo.city', ''] },
                            {
                                $cond: [
                                    {
                                        $and: [
                                            { $ne: ['$personalInfo.city', ''] },
                                            { $ne: ['$personalInfo.state', ''] }
                                        ]
                                    }, ', ', ''
                                ]
                            },
                            { $ifNull: ['$personalInfo.state', ''] }
                        ]
                    },
                    dob: '$personalInfo.dob',
                    gender:"$personalInfo.gender",
                    diet:"$personalInfo.diet",
                    height:"$personalInfo.height",
                    martialStatus:"$personalInfo.martialStatus",
                    company: '$professionalInfo.company',
                    jobTitle: '$professionalInfo.jobTitle',
                    religion: '$religiousInfo.religion',
                    community: '$religiousInfo.community',
                    subcommunity: '$religiousInfo.subcommunity',
                    highestQualification:"$professionalInfo.highestQualification",
                    college:"$professionalInfo.college",
                    annualIncome:"$professionalInfo.annualIncome",
                    companyType:"$professionalInfo.workDetails.companyType",
                    position:"$professionalInfo.workDetails.position",
                    companyName:"$professionalInfo.workDetails.companyName",
                    profileImage: { $ifNull: ['$profileImage.profileImageUrl', 'N/A'] },
                    planName: '$planName'
                }
            }
        ]);

        // Check if user was found
        if (!users || users.length === 0) {
            return apiResponse(res, {
                success: false,
                message: 'User not found',
                data: null,
                statusCode: 404,
            });
        }

        // Return the user data (first element since we're querying by ID)
        return apiResponse(res, {
            success: true,
            message: 'User retrieved successfully',
            data: users[0],
            statusCode: 200,
        });

    } catch (error) {
        console.error('Error retrieving user by ID:', error);
        return apiResponse(res, {
            success: false,
            message: 'Internal server error',
            data: null,
            statusCode: 500,
        });
    }
};



module.exports = { getAllUsersDetails, exportUsersToCsv ,getUserById};
