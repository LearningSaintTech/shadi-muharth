const mongoose = require('mongoose');
const { apiResponse } = require('../../utils/apiResponse');
const UserPersonalInfo = require("../../models/userProfile/userPersonalinfo");
const UserProfessionalInfo = require("../../models/userProfile/userProfessionalinfo");
const UserReligionInfo = require("../../models/userProfile/userReligionInfo");
const UserProfileImage = require("../../models/userProfile/userProfileImage");

// Helper function to calculate age from date of birth
const calculateAge = (dob) => {
  const diff = Date.now() - new Date(dob).getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

// Helper function to create a looser regex for partial matches
const createLooseRegex = (keyword) => {
  const loosePattern = keyword.split('').join('.*');
  return new RegExp(loosePattern, 'i');
};

// Search controller
const searchUsers = async (req, res) => {
  try {
    const { keyword } = req.query;
    const userId = req.userId; // Assuming req.user contains authenticated user info

    if (!keyword) {
      return apiResponse(res, {
        success: false,
        message: 'Keyword is required',
        statusCode: 400
      });
    }

    if (!userId) {
      return apiResponse(res, {
        success: false,
        message: 'User authentication required',
        statusCode: 401
      });
    }

    // Fetch the authenticated user's gender
    const currentUser = await UserPersonalInfo.findOne({ userId }).select('gender');
    if (!currentUser) {
      return apiResponse(res, {
        success: false,
        message: 'User personal info not found',
        statusCode: 404
      });
    }

    const userGender = currentUser.gender;
    const targetGender = userGender === 'Male' ? 'Female' : 'Male';

    // Create regex for exact and loose matching
    const exactRegex = new RegExp(keyword, 'i');
    const looseRegex = createLooseRegex(keyword);

    // Search queries for exact matches with gender filter
    const personalInfoQuery = {
      $and: [
        { gender: targetGender },
        {
          $or: [
            { fullName: exactRegex },
            { profileFor: exactRegex },
            { gender: exactRegex },
            { country: exactRegex },
            { state: exactRegex },
            { city: exactRegex },
            { district: exactRegex },
            { block: exactRegex },
            { emailId: exactRegex },
            { martialStatus: exactRegex },
            { diet: exactRegex }
          ]
        }
      ]
    };

    const professionalInfoQuery = {
      userId: {
        $in: await UserPersonalInfo.find({ gender: targetGender }).distinct('userId')
      },
      $or: [
        { highestQualification: exactRegex },
        { college: exactRegex },
        { 'workDetails.companyType': exactRegex },
        { 'workDetails.position': exactRegex },
        { 'workDetails.companyName': exactRegex }
      ]
    };

    const religionInfoQuery = {
      userId: {
        $in: await UserPersonalInfo.find({ gender: targetGender }).distinct('userId')
      },
      $or: [
        { religion: exactRegex },
        { community: exactRegex },
        { subcommunity: exactRegex }
      ]
    };

    // Search queries for loose matches with gender filter
    const loosePersonalInfoQuery = {
      $and: [
        { gender: targetGender },
        {
          $or: [
            { fullName: looseRegex },
            { profileFor: looseRegex },
            { gender: looseRegex },
            { country: looseRegex },
            { state: looseRegex },
            { city: looseRegex },
            { district: looseRegex },
            { block: looseRegex },
            { emailId: looseRegex },
            { martialStatus: looseRegex },
            { diet: looseRegex }
          ]
        }
      ]
    };

    const looseProfessionalInfoQuery = {
      userId: {
        $in: await UserPersonalInfo.find({ gender: targetGender }).distinct('userId')
      },
      $or: [
        { highestQualification: looseRegex },
        { college: looseRegex },
        { 'workDetails.companyType': looseRegex },
        { 'workDetails.position': looseRegex },
        { 'workDetails.companyName': looseRegex }
      ]
    };

    const looseReligionInfoQuery = {
      userId: {
        $in: await UserPersonalInfo.find({ gender: targetGender }).distinct('userId')
      },
      $or: [
        { religion: looseRegex },
        { community: looseRegex },
        { subcommunity: looseRegex }
      ]
    };

    // Perform exact match queries first
    const [exactPersonalResults, exactProfessionalResults, exactReligionResults] = await Promise.all([
      UserPersonalInfo.find(personalInfoQuery).select('userId fullName dob height city state'),
      UserProfessionalInfo.find(professionalInfoQuery).select('userId'),
      UserReligionInfo.find(religionInfoQuery).select('userId')
    ]);

    // Combine exact match userIds
    const exactUserIds = new Set([
      ...exactPersonalResults.map(doc => doc.userId.toString()),
      ...exactProfessionalResults.map(doc => doc.userId.toString()),
      ...exactReligionResults.map(doc => doc.userId.toString())
    ]);

    let finalResults = [];
    let message = 'Search completed successfully';
    let isLooseMatch = false;

    // If no exact matches, try loose matching
    if (exactUserIds.size === 0) {
      const [loosePersonalResults, looseProfessionalResults, looseReligionResults] = await Promise.all([
        UserPersonalInfo.find(loosePersonalInfoQuery).select('userId fullName dob height city state'),
        UserProfessionalInfo.find(looseProfessionalInfoQuery).select('userId'),
        UserReligionInfo.find(looseReligionInfoQuery).select('userId')
      ]);

      // Combine loose match userIds
      const looseUserIds = new Set([
        ...loosePersonalResults.map(doc => doc.userId.toString()),
        ...looseProfessionalResults.map(doc => doc.userId.toString()),
        ...looseReligionResults.map(doc => doc.userId.toString())
      ]);

      // Fetch personal info and profile image for matched users
      finalResults = await UserPersonalInfo.aggregate([
        {
          $match: {
            userId: { $in: Array.from(looseUserIds).map(id => new mongoose.Types.ObjectId(id)) },
            gender: targetGender
          }
        },
        {
          $lookup: {
            from: 'userprofileimages',
            localField: 'userId',
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
            userId: 1,
            fullName: 1,
            dob: 1,
            height: 1,
            city: 1,
            state: 1,
            profilePhoto: { $ifNull: ['$profileImage.profileImageUrl', null] }
          }
        }
      ]);

      isLooseMatch = true;
      message = 'No exact matches found, showing partial matches';
    } else {
      // Fetch personal info and profile image for exact matched users
      finalResults = await UserPersonalInfo.aggregate([
        {
          $match: {
            userId: { $in: Array.from(exactUserIds).map(id => new mongoose.Types.ObjectId(id)) },
            gender: targetGender
          }
        },
        {
          $lookup: {
            from: 'userprofileimages',
            localField: 'userId',
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
            userId: 1,
            fullName: 1,
            dob: 1,
            height: 1,
            city: 1,
            state: 1,
            profilePhoto: { $ifNull: ['$profileImage.profileImageUrl', null] }
          }
        }
      ]);
    }

    // Format the response
    const formattedResults = finalResults.map(user => ({
      userId: user.userId,
      profilePhoto: user.profilePhoto,
      age: calculateAge(user.dob),
      height: user.height,
      fullName: user.fullName,
      location: `${user.city}, ${user.state}`
    }));

    return apiResponse(res, {
      success: true,
      message,
      data: {
        count: formattedResults.length,
        results: formattedResults,
        matchType: isLooseMatch ? 'partial' : 'exact'
      },
      statusCode: 200
    });
  } catch (error) {
    console.error('Search error:', error);
    return apiResponse(res, {
      success: false,
      message: 'Server error while searching',
      data: { error: error.message },
      statusCode: 500
    });
  }
};

module.exports = { searchUsers };