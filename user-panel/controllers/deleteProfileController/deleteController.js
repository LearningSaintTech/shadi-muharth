const UserAuth = require("../../models/userAuth/Auth");
const UserPersonalInfo = require("../../models/userProfile/userPersonalinfo");
const UserProffesionalInfo = require("../../models/userProfile/userProfessionalinfo");
const UserReligiousInfo = require("../../models/userProfile/userReligionInfo");
const UserProfileImage = require("../../models/userProfile/userProfileImage");
const UserImageGallery = require("../../models/userProfile/userImageGallery");
const Chat = require("../../models/chat/chat");
const ChatRequest = require("../../models/chat/chatRequest");
const { apiResponse } = require('../../../utils/apiResponse');

// Delete User Profile
const deleteProfile = async (req, res) => {
  try {
    const userId = req.userId;

    // Validate user exists
    const user = await UserAuth.findById(userId);
    if (!user) {
      return apiResponse(res, {
        success: false,
        message: 'User not found',
        statusCode: 404
      });
    }

    // Delete UserAuth record
    const deletedUser = await UserAuth.findByIdAndDelete(userId);
    if (!deletedUser) {
      return apiResponse(res, {
        success: false,
        message: 'Failed to delete user account',
        statusCode: 500
      });
    }

    // Delete UserPersonalInfo record
    await UserPersonalInfo.findOneAndDelete({ userId });

    // Delete UserProffesionalInfo record
    await UserProffesionalInfo.findOneAndDelete({ userId });

    // Delete UserReligiousInfo record
    await UserReligiousInfo.findOneAndDelete({ userId });

    // Delete UserProfileImage record
    await UserProfileImage.findOneAndDelete({ userId });

    // Delete UserImageGallery records
    await UserImageGallery.deleteMany({ userId });

    // Delete Chat records where user is sender or receiver
    await Chat.deleteMany({
      $or: [
        { senderId: userId },
        { receiverId: userId }
      ]
    });

    // Delete ChatRequest records where user is sender or receiver
    await ChatRequest.deleteMany({
      $or: [
        { senderId: userId },
        { receiverId: userId }
      ]
    });

    return apiResponse(res, {
      success: true,
      message: 'User profile and associated data deleted successfully',
      data: {}
    });
  } catch (error) {
    return apiResponse(res, {
      success: false,
      message: 'Server error while deleting user profile',
      statusCode: 500
    });
  }
};


module.exports = {deleteProfile}