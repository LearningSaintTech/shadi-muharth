const userAuth = require('../../../models/userAuth/Auth');
const { apiResponse } = require('../../../utils/apiResponse');

// Controller to fetch user details (fullName, email, address, mobileNumber, profileImage, planName)
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
          email: 1,
          address: {
            $concat: [
              { $ifNull: ['$personalInfo.block', ''] },
              {
                $cond: [
                  { $and: [
                    { $ne: ['$personalInfo.block', ''] },
                    { $ne: ['$personalInfo.district', ''] }
                  ] }, ', ', ''
                ]
              },
              { $ifNull: ['$personalInfo.district', ''] },
              {
                $cond: [
                  { $and: [
                    { $ne: ['$personalInfo.district', ''] },
                    { $ne: ['$personalInfo.city', ''] }
                  ] }, ', ', ''
                ]
              },
              { $ifNull: ['$personalInfo.city', ''] },
              {
                $cond: [
                  { $and: [
                    { $ne: ['$personalInfo.city', ''] },
                    { $ne: ['$personalInfo.state', ''] }
                  ] }, ', ', ''
                ]
              },
              { $ifNull: ['$personalInfo.state', ''] }
            ]
          },
          mobileNumber: '$personalInfo.mobileNumber',
          profileImage: '$profileImage.profileImageUrl', // Adjust this field name if needed
          planName: '$planName' // Ensure this is the correct field name in userAuth
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

module.exports = { getAllUsersDetails };
