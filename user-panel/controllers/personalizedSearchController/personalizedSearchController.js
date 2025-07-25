const mongoose = require("mongoose");
const UserPersonalInfo = require("../../models/userProfile/userPersonalinfo");
const UserProfessionalInfo = require("../../models/userProfile/userProfessionalinfo");
const UserReligionInfo = require("../../models/userProfile/userReligionInfo");
const UserProfileImage = require("../../models/userProfile/userProfileImage");
const { apiResponse } = require('../../../utils/apiResponse');

// Helper function to calculate age from DOB
const calculateAge = (dob) => {
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Helper function to get age range
const getAgeRange = (age) => {
  if (age >= 18 && age <= 22) return '18-22';
  if (age >= 23 && age <= 27) return '23-27';
  if (age >= 28 && age <= 32) return '28-32';
  if (age >= 33 && age <= 37) return '33-37';
  if (age >= 38 && age <= 42) return '38-42';
  if (age >= 43 && age <= 47) return '43-47';
  if (age >= 48 && age <= 52) return '48-52';
  if (age >= 53 && age <= 60) return '53-60';
  return '60+';
};

// Helper function to get relaxed age range
const getRelaxedAgeRange = (ageRange) => {
  const ranges = ['18-22', '23-27', '28-32', '33-37', '38-42', '43-47', '48-52', '53-60', '60+'];
  const index = ranges.indexOf(ageRange);
  if (index === -1) return ranges; // Return all ranges if invalid
  const nearbyRanges = [ranges[index]];
  if (index > 0) nearbyRanges.push(ranges[index - 1]);
  if (index < ranges.length - 1) nearbyRanges.push(ranges[index + 1]);
  return nearbyRanges;
};

// Controller to find matches
const filterUsers = async (req, res) => {
  try {
    const preferences = req.body;
    const userId = req.userId; 

    if (!userId) {
      return apiResponse(res, {
        success: false,
        message: 'User not authenticated',
        statusCode: 401
      });
    }

    // Fetch current user's personal info to determine gender
    const currentUser = await UserPersonalInfo.findOne({ userId }).lean();
    if (!currentUser) {
      return apiResponse(res, {
        success: false,
        message: 'User personal info not found',
        statusCode: 404
      });
    }

    // Determine target gender (opposite of current user's gender)
    const targetGender = currentUser.gender === 'Male' ? 'Female' : 'Male';

    // Build query for potential matches
    const personalQuery = { gender: targetGender };
    const religionQuery = {};
    const professionalQuery = {};

    // Personal Info Filters (only add if provided in preferences)
    if (preferences.ageRange) {
      const [minAge, maxAge] = preferences.ageRange.split('-').map(Number);
      const currentYear = new Date().getFullYear();
      personalQuery.dob = {
        $gte: new Date(currentYear - maxAge - 1, 11, 31),
        $lte: new Date(currentYear - minAge, 0, 1)
      };
    }
    if (preferences.country) personalQuery.country = preferences.country;
    if (preferences.state) personalQuery.state = preferences.state;
    if (preferences.city) personalQuery.city = preferences.city;
    if (preferences.district) personalQuery.district = preferences.district;
    if (preferences.block) personalQuery.block = preferences.block;
    if (preferences.maritalStatus) personalQuery.maritalStatus = preferences.maritalStatus;
    if (preferences.height) personalQuery.height = preferences.height;
    if (preferences.diet) personalQuery.diet = preferences.diet;

    // Religion Info Filters
    if (preferences.religion) religionQuery.religion = preferences.religion;
    if (preferences.community) religionQuery.community = preferences.community;
    if (preferences.subcommunity) religionQuery.subcommunity = preferences.subcommunity;
    if (preferences.casteNoBar !== undefined) religionQuery.casteNoBar = preferences.casteNoBar;

    // Professional Info Filters
    if (preferences.highestQualification) professionalQuery.highestQualification = preferences.highestQualification;
    if (preferences.college) professionalQuery.college = preferences.college;
    if (preferences.annualIncome) professionalQuery.annualIncome = { $gte: preferences.annualIncome };
    if (preferences.workDetails) {
    if (preferences.workDetails.companyType) professionalQuery['workDetails.companyType'] = preferences.workDetails.companyType;
    if (preferences.workDetails.position) professionalQuery['workDetails.position'] = preferences.workDetails.position;
    if (preferences.workDetails.companyName) professionalQuery['workDetails.companyName'] = preferences.workDetails.companyName;
    }

    // Fetch potential matches
    let personalMatches = await UserPersonalInfo.find(personalQuery).lean();
    let religionMatches = await UserReligionInfo.find(religionQuery).lean();
    let professionalMatches = await UserProfessionalInfo.find(professionalQuery).lean();
    let profileImageMatches = await UserProfileImage.find({}).lean();

    // If no matches found, relax constraints and fetch random profiles
    if (personalMatches.length === 0) {
      const relaxedPersonalQuery = { gender: targetGender };
      if (preferences.ageRange) {
        const relaxedRanges = getRelaxedAgeRange(preferences.ageRange);
        const currentYear = new Date().getFullYear();
        const minAges = relaxedRanges.map(r => parseInt(r.split('-')[0]));
        const maxAges = relaxedRanges.map(r => parseInt(r.split('-')[1] || '100'));
        relaxedPersonalQuery.dob = {
          $gte: new Date(currentYear - Math.max(...maxAges) - 1, 11, 31),
          $lte: new Date(currentYear - Math.min(...minAges), 0, 1)
        };
      }
      if (preferences.country) relaxedPersonalQuery.country = preferences.country;
      if (preferences.religion) religionQuery.religion = preferences.religion;

      personalMatches = await UserPersonalInfo.find(relaxedPersonalQuery).lean();
      religionMatches = await UserReligionInfo.find({ religion: preferences.religion || { $exists: true } }).lean();
      professionalMatches = await UserProfessionalInfo.find({}).lean();
      profileImageMatches = await UserProfileImage.find({}).lean();
    }

    // Create maps for easier lookup
    const religionMap = new Map(religionMatches.map(r => [r.userId.toString(), r]));
    const professionalMap = new Map(professionalMatches.map(p => [p.userId.toString(), p]));
    const profileImageMap = new Map(profileImageMatches.map(p => [p.userId.toString(), p]));

    // Calculate match scores
    let matches = personalMatches
      .filter(p => p.userId.toString() !== userId.toString()) // Exclude current user
      .map(personal => {
        const userIdStr = personal.userId.toString();
        const religion = religionMap.get(userIdStr);
        const professional = professionalMap.get(userIdStr);
        const profileImage = profileImageMap.get(userIdStr);

        // Skip if missing required info
        if (!religion || !professional) return null;

        let score = 0;
        const maxScore = Object.keys(preferences).length * 10;

        // Scoring based on matching preferences
        if (preferences.ageRange && getAgeRange(calculateAge(personal.dob)) === preferences.ageRange) score += 10;
        if (preferences.country && personal.country === preferences.country) score += 10;
        if (preferences.state && personal.state === preferences.state) score += 10;
        if (preferences.city && personal.city === preferences.city) score += 10;
        if (preferences.district && personal.district === preferences.district) score += 10;
        if (preferences.block && personal.block === preferences.block) score += 10;
        if (preferences.maritalStatus && personal.martialStatus === preferences.maritalStatus) score += 10;
        if (preferences.height && personal.height === preferences.height) score += 10;
        if (preferences.diet && personal.diet === preferences.diet) score += 10;
        if (preferences.religion && religion.religion === preferences.religion) score += 10;
        if (preferences.community && religion.community === preferences.community) score += 10;
        if (preferences.subcommunity && religion.subcommunity === preferences.subcommunity) score += 10;
        if (preferences.casteNoBar !== undefined && religion.casteNoBar === preferences.casteNoBar) score += 10;
        if (preferences.highestQualification && professional.highestQualification === preferences.highestQualification) score += 10;
        if (preferences.college && professional.college === preferences.college) score += 10;
        if (preferences.annualIncome && professional.annualIncome >= preferences.annualIncome) score += 10;
        if (preferences.workDetails) {
          if (preferences.workDetails.companyType && professional.workDetails.companyType === preferences.workDetails.companyType) score += 10;
          if (preferences.workDetails.position && professional.workDetails.position === preferences.workDetails.position) score += 10;
          if (profileImage && preferences.workDetails.companyName && professional.workDetails.companyName === preferences.workDetails.companyName) score += 10;
        }

        return {
          userId: personal.userId,
          profileImageUrl: profileImage ? profileImage.profileImageUrl : null,
          height: personal.height,
          fullName: personal.fullName,
          age: calculateAge(personal.dob),
          location: `${personal.city}, ${personal.state}`,
          score: maxScore ? (score / maxScore) * 100 : 10 // Default low score for relaxed matches
        };
      })
      .filter(match => match !== null) // Remove incomplete matches
      .sort((a, b) => b.score - a.score); // Sort by score descending

    // If still no matches, return empty result
    if (matches.length === 0) {
      return apiResponse(res, {
        success: true,
        message: 'No matches found, even with relaxed criteria',
        data: [],
        statusCode: 200
      });
    }

    // Randomize matches if using relaxed criteria and more than 10 matches
    if (personalMatches.length > 10 && !preferences.ageRange && !preferences.country && !preferences.religion) {
      matches = matches.sort(() => Math.random() - 0.5);
    }

    return apiResponse(res, {
      success: true,
      message: matches[0].score < 50 ? 'Limited matches found with relaxed criteria' : 'Matches retrieved successfully',
      data: matches.slice(0, 10), // Return top 10 matches
      statusCode: 200
    });
  } catch (error) {
    console.error('Error in matchmaking:', error);
    return apiResponse(res, {
      success: false,
      message: 'Internal server error',
      statusCode: 500
    });
  }
};

module.exports = { filterUsers };