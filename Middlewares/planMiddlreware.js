const mongoose = require('mongoose');
const SubscriptionPlan = require('../models/subscriptionPlans/subscriptionPlans');
const Chat = require("../models/chat/chat");
const User = require('../models/userAuth/Auth');
const ChatRequest = require("../models/chat/chatRequest");
const { apiResponse } = require('../utils/apiResponse');

// Middleware to check access based on subscription plan
const restrictAccess = (requiredFeature) => {
  return async (req, res, next) => {
    try {
      console.log(`[restrictAccess] Checking access for feature: ${requiredFeature}`);
      const userId = req.userId;
      console.log(`[restrictAccess] User ID: ${userId}`);

      if (!userId) {
        console.log('[restrictAccess] No userId found in request');
        return apiResponse(res, {
          success: false,
          message: 'Unauthorized: User not authenticated',
          statusCode: 401,
        });
      }

      // Fetch the user and populate their subscription plan
      console.log(`[restrictAccess] Fetching user with ID: ${userId}`);
      const user = await User.findById(userId).populate('assignedPlanID');
      if (!user) {
        console.log(`[restrictAccess] User not found for ID: ${userId}`);
        return apiResponse(res, {
          success: false,
          message: 'No active subscription plan found',
          statusCode: 403,
        });
      }
      if (!user.assignedPlanID) {
        console.log(`[restrictAccess] No assignedPlanID for user ID: ${userId}`);
        return apiResponse(res, {
          success: false,
          message: 'No active subscription plan found',
          statusCode: 403,
        });
      }

      const plan = user.assignedPlanID; // Populated SubscriptionPlan document
      console.log(`[restrictAccess] User plan: ${plan.planName} (ID: ${plan._id})`);

      // Check if the required feature is allowed in the user's plan
      let hasAccess = false;
      console.log(`[restrictAccess] Checking feature access for: ${requiredFeature}`);
      switch (requiredFeature) {
        case 'personalInfo':
        case 'religiousInfo':
        case 'professionalInfo':
          hasAccess = plan.profileDetails[requiredFeature];
          console.log(`[restrictAccess] Profile detail ${requiredFeature}: ${hasAccess}`);
          break;
        case 'profilePhoto':
          hasAccess = plan.profilePhoto;
          console.log(`[restrictAccess] Profile photo access: ${hasAccess}`);
          break;
        case 'imageGallery':
          hasAccess = plan.imageGallery;
          console.log(`[restrictAccess] Image gallery access: ${hasAccess}`);
          break;
        case 'chat':
          hasAccess = plan.chat.enabled;
          console.log(`[restrictAccess] Chat enabled: ${hasAccess}, Message limit: ${plan.chat.messageLimit}`);
          if (hasAccess && plan.chat.messageLimit !== -1) {
            const messageCount = await checkMessageCount(userId);
            console.log(`[restrictAccess] Current message count: ${messageCount}, Limit: ${plan.chat.messageLimit}`);
            if (messageCount >= plan.chat.messageLimit) {
              console.log(`[restrictAccess] Chat message limit exceeded for user ID: ${userId}`);
              return apiResponse(res, {
                success: false,
                message: 'Chat message limit exceeded (Silver: 50 messages, Gold: unlimited)',
                statusCode: 403,
              });
            }
          }
          break;
        case 'interestSend':
          const interestCount = await checkInterestCount(userId);
          console.log(`[restrictAccess] Current interest count: ${interestCount}, Limit: ${plan.interestSend}`);
          if (interestCount >= plan.interestSend) {
            console.log(`[restrictAccess] Interest send limit exceeded for user ID: ${userId}`);
            return apiResponse(res, {
              success: false,
              message: 'Interest send limit exceeded',
              statusCode: 403,
            });
          }
          hasAccess = plan.interestSend > 0;
          console.log(`[restrictAccess] Interest send access: ${hasAccess}`);
          break;
        case 'interestView':
          hasAccess = plan.interestView;
          console.log(`[restrictAccess] Interest view access: ${hasAccess}`);
          break;
        case 'personalizedMatch':
          hasAccess = plan.personalizedMatch;
          console.log(`[restrictAccess] Personalized match access: ${hasAccess}`);
          break;
        case 'whatsappSupport':
          hasAccess = plan.whatsappSupport;
          console.log(`[restrictAccess] WhatsApp support access: ${hasAccess}`);
          break;
        case 'profilePlanTag':
          hasAccess = plan.profilePlanTag;
          console.log(`[restrictAccess] Profile plan tag access: ${hasAccess}`);
          break;
        case 'emailAlert':
          hasAccess = plan.emailAlert;
          console.log(`[restrictAccess] Email alert access: ${hasAccess}`);
          break;
        case 'smsAlert':
          hasAccess = plan.smsAlert;
          console.log(`[restrictAccess] SMS alert access: ${hasAccess}`);
          break;
        default:
          console.log(`[restrictAccess] Invalid feature requested: ${requiredFeature}`);
          return apiResponse(res, {
            success: false,
            message: 'Invalid feature requested',
            statusCode: 400,
          });
      }

      if (!hasAccess) {
        console.log(`[restrictAccess] Access denied for feature ${requiredFeature} for user ID: ${userId}`);
        return apiResponse(res, {
          success: false,
          message: `Access to ${requiredFeature} is restricted for your plan`,
          statusCode: 403,
        });
      }

      console.log(`[restrictAccess] Access granted for feature ${requiredFeature} for user ID: ${userId}`);
      // If access is granted, proceed to the next middleware/route handler
      next();
    } catch (error) {
      console.error(`[restrictAccess] Error for user ID: ${req.userId || 'unknown'}:`, error);
      return apiResponse(res, {
        success: false,
        message: 'Server error while checking access',
        statusCode: 500,
      });
    }
  };
};

async function checkMessageCount(userId) {
  console.log(`[checkMessageCount] Fetching message count for user ID: ${userId}`);
  const chatCount = await Chat.countDocuments({ senderId: userId });
  const requestCount = await ChatRequest.countDocuments({ senderId: userId, status: 'accepted' });
  const totalCount = chatCount + requestCount;
  console.log(`[checkMessageCount] Total message count for user ID ${userId}: ${totalCount} (Chats: ${chatCount}, Accepted Requests: ${requestCount})`);
  return totalCount;
}

// Placeholder helper function to check interest count
async function checkInterestCount(userId) {
  console.log(`[checkInterestCount] Fetching interest count for user ID: ${userId}`);
  // Implement logic to fetch interest sent count from a usage tracking model
  // Example: return await InterestUsage.findOne({ userId }).count || 0;
  const count = 0; // Replace with actual logic
  console.log(`[checkInterestCount] Interest count for user ID ${userId}: ${count}`);
  return count;
}

module.exports = { restrictAccess };