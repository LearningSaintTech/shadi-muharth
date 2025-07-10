const SubscriptionPlan = require('../../models/subscriptionPlans/subscriptionPlans'); 
const { apiResponse } = require('../../utils/apiResponse'); 
const mongoose = require("mongoose");

// Add a new subscription plan
const addPlan = async (req, res) => {
  try {
    const {
      planName,
      price,
      duration,
      profileDetails,
      profilePhoto,
      imageGallery,
      chat,
      interestSend,
      interestView,
      personalizedMatch,
      whatsappSupport,
      profilePlanTag,
      emailAlert,
      smsAlert,
    } = req.body;

     //Check if plan with the same name already exists
    const existingPlan = await SubscriptionPlan.findOne({ planName: planName.trim() });
    if (existingPlan) {
      return apiResponse(res, {
        success: false,
        message: `Plan already exists.`,
        statusCode: 409, // Conflict
      });
    }


    // Create new plan
    const newPlan = new SubscriptionPlan({
      planName,
      price,
      duration,
      profileDetails: profileDetails || {
        personalInfo: false,
        religiousInfo: false,
        professionalInfo: false,
      },
      profilePhoto: profilePhoto || false,
      imageGallery: imageGallery || false,
      chat: chat || { enabled: false, messageLimit: 0 },
      interestSend: interestSend || 0,
      interestView: interestView || false,
      personalizedMatch: personalizedMatch || false,
      whatsappSupport: whatsappSupport || false,
      profilePlanTag: profilePlanTag || false,
      emailAlert: emailAlert || false,
      smsAlert: smsAlert || false,
    });

    // Save plan to database
    await newPlan.save();

    return apiResponse(res, {
      success: true,
      message: 'Subscription plan added successfully.',
      data: newPlan,
      statusCode: 201,
    });
  } catch (error) {
    return apiResponse(res, {
      success: false,
      message: 'Failed to add subscription plan.',
      data: { error: error.message },
      statusCode: 500,
    });
  }
};

// Get all subscription plans
const getPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find();

    return apiResponse(res, {
      success: true,
      message: 'Subscription plans retrieved successfully.',
      data: plans,
      statusCode: 200,
    });
  } catch (error) {
    return apiResponse(res, {
      success: false,
      message: 'Failed to retrieve subscription plans.',
      data: { error: error.message },
      statusCode: 500,
    });
  }
};


// Get a subscription plan by ID
const getPlanById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!mongoose.isValidObjectId(id)) {
      return apiResponse(res, {
        success: false,
        message: 'Invalid plan ID format.',
        statusCode: 400,
      });
    }

    // Find plan by ID
    const plan = await SubscriptionPlan.findById(id);

    // Check if plan exists
    if (!plan) {
      return apiResponse(res, {
        success: false,
        message: 'Subscription plan not found.',
        statusCode: 404,
      });
    }

    return apiResponse(res, {
      success: true,
      message: 'Subscription plan retrieved successfully.',
      data: plan,
      statusCode: 200,
    });
  } catch (error) {
    return apiResponse(res, {
      success: false,
      message: 'Failed to retrieve subscription plan.',
      data: { error: error.message },
      statusCode: 500,
    });
  }
};

module.exports = {addPlan,getPlans,getPlanById}