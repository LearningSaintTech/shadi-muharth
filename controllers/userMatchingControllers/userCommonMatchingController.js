const mongoose = require('mongoose');
const UserPersonalInfo = require('../../models/userProfile/userPersonalinfo');
const UserProfessionalInfo = require('../../models/userProfile/userProfessionalinfo');
const UserReligionInfo = require('../../models/userProfile/userReligionInfo');
const UserProfileImage = require('../../models/userProfile/userProfileImage');
const { apiResponse } = require('../../utils/apiResponse');

// Helper function to calculate age from DOB
const calculateAge = (dob) => {
  const diff = Date.now() - new Date(dob).getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

// Helper function to calculate location proximity score
const calculateLocationScore = (user1, user2) => {
  if (user1.country !== user2.country) return 0;
  if (user1.state !== user2.state) return 50;
  if (user1.city === user2.city) return 100;
  return 75; // Same state, different city
};

// Helper function to calculate age compatibility score
const calculateAgeScore = (user1Age, user2Age, preferredAgeRange = 5) => {
  const ageDiff = Math.abs(user1Age - user2Age);
  if (ageDiff > preferredAgeRange) return 0;
  return 100 - (ageDiff / preferredAgeRange) * 100;
};

// Helper function to calculate professional compatibility score
const calculateProfessionalScore = (user1, user2) => {
  let score = 0;
  if (user1.highestQualification === user2.highestQualification) score += 50;
  const incomeDiff = Math.abs(user1.annualIncome - user2.annualIncome);
  const incomeScore = incomeDiff < 50000 ? 50 : 25;
  return score + incomeScore;
};

// Helper function to calculate religion compatibility score
const calculateReligionScore = (user1, user2) => {
  if (user1.religion !== user2.religion) return 0;
  if (user1.casteNoBar || user2.casteNoBar) return 100;
  if (user1.community === user2.community) return 80;
  return 50;
};

// Main matching function
const findMatchesLogic = async (userId, limit = 10) => {
  try {
    const userPersonal = await UserPersonalInfo.findOne({ userId });
    const userProfessional = await UserProfessionalInfo.findOne({ userId });
    const userReligion = await UserReligionInfo.findOne({ userId });

    if (!userPersonal || !userProfessional || !userReligion) {
      throw new Error('User data incomplete');
    }

    const userAge = calculateAge(userPersonal.dob);
    const targetGender = userPersonal.gender === 'Male' ? 'Female' : 'Male';

    const potentialMatches = await UserPersonalInfo.find({
      gender: targetGender,
      country: userPersonal.country,
      _id: { $ne: userPersonal._id },
    });

    const matches = [];

    for (const match of potentialMatches) {
      const matchProfessional = await UserProfessionalInfo.findOne({ userId: match.userId });
      const matchReligion = await UserReligionInfo.findOne({ userId: match.userId });
      const matchProfileImage = await UserProfileImage.findOne({ userId: match.userId });

      if (!matchProfessional || !matchReligion) continue;

      const matchAge = calculateAge(match.dob);

      const locationScore = calculateLocationScore(userPersonal, match);
      const ageScore = calculateAgeScore(userAge, matchAge);
      const professionalScore = calculateProfessionalScore(userProfessional, matchProfessional);
      const religionScore = calculateReligionScore(userReligion, matchReligion);

      const totalScore =
        locationScore * 0.3 +
        ageScore * 0.3 +
        professionalScore * 0.2 +
        religionScore * 0.2;

      if (totalScore > 50) {
        matches.push({
          userId: match.userId,
          fullName: match.fullName,
          age: matchAge,
          profileImage: matchProfileImage?.profileImageUrl || null,
          location: `${match.city}, ${match.state}, ${match.country}`,
          height: match.height
        });
      }
    }

    // If no matches found, fetch fallback matches (opposite gender, same country)
    if (matches.length === 0) {
      const fallbackMatches = await UserPersonalInfo.find({
        gender: targetGender,
        country: userPersonal.country,
        _id: { $ne: userPersonal._id },
      })
        .sort({ dob: -1 }) // Sort by age (youngest first)
        .limit(limit);

      for (const match of fallbackMatches) {
        const matchProfileImage = await UserProfileImage.findOne({ userId: match.userId });
        matches.push({
          userId: match.userId,
          fullName: match.fullName,
          age: calculateAge(match.dob),
          profileImage: matchProfileImage?.profileImageUrl || null,
          location: `${match.city}, ${match.state}, ${match.country}`,
          height: match.height
        });
      }
    }

    // Sort primary matches by score, keep fallback matches as sorted by age
    if (matches.some(match => match.score !== null)) {
      matches.sort((a, b) => (b.score || 0) - (a.score || 0));
    }

    return matches.slice(0, limit);
  } catch (error) {
    console.error('Error in matching algorithm:', error);
    throw error;
  }
};

// Controller function for common matches
const findMatches = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    if (limit < 1 || limit > 100) {
      return apiResponse(res, {
        success: false,
        message: 'Limit must be between 1 and 100',
        statusCode: 400
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.userId)) {
      return apiResponse(res, {
        success: false,
        message: 'Invalid user ID',
        statusCode: 400
      });
    }

    const userId = new mongoose.Types.ObjectId(req.userId);
    const matches = await findMatchesLogic(userId, limit);

    return apiResponse(res, {
      success: true,
      message: matches.length > 0 && matches.some(match => match.score !== null)
        ? 'Matches retrieved successfully'
        : 'No strong matches found, showing suggested profiles',
      data: matches,
      statusCode: 200
    });
  } catch (error) {
    console.error(`Error in findMatches for userId ${req.userId}:`, error);
    return apiResponse(res, {
      success: false,
      message: `Error finding matches: ${error.message}`,
      statusCode: 500
    });
  }
};

module.exports = { findMatches };