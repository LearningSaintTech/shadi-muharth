const subscriptionPlans = require('../../../models/subscriptionPlans/subscriptionPlans');
const { apiResponse } = require('../../../utils/apiResponse');

// Controller to get planName, duration, and price for all subscription plans
const getSubscriptionPlans = async (req, res) => {
  try {
    const plans = await subscriptionPlans.find({}, 'planName duration price');
    return apiResponse(res, {
      success: true,
      message: 'Subscription plans retrieved successfully',
      data: { plans },
      statusCode: 200,
    });
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return apiResponse(res, {
      success: false,
      message: 'Internal server error',
      data: null,
      statusCode: 500,
    });
  }
};


// Controller to update subscription plan details
const updateSubscriptionPlan = async (req, res) => {
  try {
    const { id } = req.params; // Plan ID from URL
    const updateData = req.body;

    // Prevent updating restricted fields
    const restrictedFields = ['planName', 'duration', 'price'];
    const hasRestrictedFields = Object.keys(updateData).some((key) =>
      restrictedFields.includes(key)
    );
    if (hasRestrictedFields) {
      return apiResponse(res, {
        success: false,
        message: 'Cannot update planName, duration, or price',
        data: null,
        statusCode: 400,
      });
    }

    // Validate updateData fields against schema
    const allowedFields = [
      'profileDetails.personalInfo',
      'profileDetails.religiousInfo',
      'profileDetails.professionalInfo',
      'profilePhoto',
      'imageGallery',
      'chat.enabled',
      'chat.messageLimit',
      'interestSend',
      'interestView',
      'personalizedMatch',
      'profileVerification',
      'whatsappSupport',
      'profilePlanTag',
      'emailAlert',
      'smsAlert',
    ];
    const invalidFields = Object.keys(updateData).filter(
      (key) => !allowedFields.includes(key) && !key.startsWith('profileDetails.') && !key.startsWith('chat.')
    );
    if (invalidFields.length > 0) {
      return apiResponse(res, {
        success: false,
        message: `Invalid fields provided: ${invalidFields.join(', ')}`,
        data: null,
        statusCode: 400,
      });
    }

    // If updating chat, ensure required fields are present
    if (updateData.chat) {
      if (updateData.chat.enabled === undefined) {
        // Fetch existing plan to preserve chat.enabled
        const existingPlan = await subscriptionPlans.findById(id).lean();
        if (!existingPlan) {
          return apiResponse(res, {
            success: false,
            message: 'Plan not found',
            data: null,
            statusCode: 404,
          });
        }
        updateData.chat.enabled = existingPlan.chat.enabled;
      }
    }

    // Find and update the plan
    const plan = await subscriptionPlans.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();

    if (!plan) {
      return apiResponse(res, {
        success: false,
        message: 'Plan not found',
        data: null,
        statusCode: 404,
      });
    }

    return apiResponse(res, {
      success: true,
      message: 'Plan updated successfully',
      data: { plan },
      statusCode: 200,
    });
  } catch (error) {
    console.error('Error updating subscription plan:', error);
    return apiResponse(res, {
      success: false,
      message: error.message || 'Internal server error',
      data: null,
      statusCode: 500,
    });
  }
};

module.exports = {getSubscriptionPlans,updateSubscriptionPlan}