const mongoose = require('mongoose');
const UserAuth = require('../../models/userAuth/Auth'); 
const SubscriptionPlan = require('../../models/subscriptionPlans/subscriptionPlans'); 
const { apiResponse } = require('../../../utils/apiResponse');

// GST rate
const GST_RATE = 0.18; // 18%

// Helper function to calculate prorated amount based on days used
const calculateProratedAmount = (currentPlan, daysUsed) => {
  const totalDays = currentPlan.duration * 30; // Assuming 30 days per month
  const remainingDays = totalDays - daysUsed;
  if (remainingDays <= 0) return 0;

  const totalPaidWithGst = Math.round(currentPlan.price * (1 + GST_RATE)); // Total paid including GST
  const dailyRate = Math.round(totalPaidWithGst / totalDays); // Daily rate
  const remainingCredit = dailyRate * remainingDays; // Remaining value for unused days
  
  return remainingCredit;
};

// Helper function to calculate days used
const getDaysUsed = (startDate) => {
  const now = new Date();
  const diffTime = now - startDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); // Exact days
  return Math.max(0, diffDays);
};

// Helper function to calculate new expiry date
const calculateNewExpiryDate = (startDate, durationMonths) => {
  const expiryDate = new Date(startDate);
  expiryDate.setMonth(expiryDate.getMonth() + durationMonths);
  return expiryDate;
};

const changePlan = async (req, res) => {
  try {
    const userId = req.userId;
    const { newPlanName } = req.body;

    // Validate new plan
    if (!['Silver', 'Gold'].includes(newPlanName)) {
      return apiResponse(res, {
        success: false,
        message: 'Invalid plan name. Only Silver or Gold plans are allowed.',
        statusCode: 400
      });
    }

    // Find user
    const user = await UserAuth.findById(userId).populate('assignedPlanID');
    if (!user) {
      return apiResponse(res, {
        success: false,
        message: 'User not found',
        statusCode: 404
      });
    }
    // Check if email is verified
    if (!user.isEmailVerified) {
      return apiResponse(res, {
        success: false,
        message: 'Please verify your email to buy a plan.',
        statusCode: 403
      });
    }

    // Check if user is already on the requested plan
    if (user.planName === newPlanName) {
      return apiResponse(res, {
        success: false,
        message: `You are already assigned to the ${newPlanName} plan`,
        statusCode: 400
      });
    }

    // Prevent downgrade from Gold to Silver
    if (user.planName === 'Gold' && newPlanName === 'Silver') {
      return apiResponse(res, {
        success: false,
        message: 'Downgrading from Gold to Silver is not allowed',
        statusCode: 400
      });
    }

    // Find new subscription plan
    const newPlan = await SubscriptionPlan.findOne({ planName: newPlanName });
    if (!newPlan) {
      return apiResponse(res, {
        success: false,
        message: 'Subscription plan not found',
        statusCode: 404
      });
    }

    const currentPlanName = user.planName;
    let currentPlan = { price: 0, duration: 1 }; // Default for Regular plan
    if (currentPlanName !== 'Regular') {
      currentPlan = await SubscriptionPlan.findById(user.assignedPlanID);
      if (!currentPlan) {
        return apiResponse(res, {
          success: false,
          message: 'Current subscription plan not found',
          statusCode: 404
        });
      }
    }

    let totalAmountWithGst = Math.round(newPlan.price * (1 + GST_RATE)); // Total amount for new plan including GST
    let amountToPay = totalAmountWithGst;
    let remainingCredit = 0;

    // Handle plan change logic (only for Silver to Gold)
    if (currentPlanName === 'Silver' && newPlanName === 'Gold') {
      // Calculate days used and remaining amount
      const daysUsed = getDaysUsed(user.planStartDate);
      remainingCredit = calculateProratedAmount(currentPlan, daysUsed);

      // Adjust amount to pay
      amountToPay = Math.max(0, totalAmountWithGst - remainingCredit);
    }

    // Update user plan details
    user.planName = newPlanName;
    user.assignedPlanID = newPlan._id;
    user.paymentStatus = true; // Silver and Gold are paid plans
    user.planStartDate = new Date();
    user.planExpiryDate = calculateNewExpiryDate(new Date(), newPlan.duration);

    await user.save();

    // Prepare response data
    const responseData = {
      userId: user._id.toString(),
      planId: newPlan._id.toString(),
      planName: newPlanName,
      originalPrice: newPlan.price,
      gstPercentage: GST_RATE * 100,
      totalAmount: totalAmountWithGst,
      remainingCredit: remainingCredit, // Included only for Silver to Gold upgrade
      finalAmountToPay: amountToPay, // Highlight final amount to be paid
      planStartDate: user.planStartDate,
      planExpiryDate: user.planExpiryDate,
      durationMonths: newPlan.duration
    };

    return apiResponse(res, {
      success: true,
      message: 'Plan changed successfully',
      data: responseData,
      statusCode: 200
    });

  } catch (error) {
    console.error('Error changing plan:', error);
    return apiResponse(res, {
      success: false,
      message: 'Internal server error',
      statusCode: 500
    });
  }
};

const getPlanDetails = async (req, res) => {
  try {
    const userId = req.userId;


    const user = await UserAuth.findById(userId).populate('assignedPlanID');
    if (!user) {
      return apiResponse(res, {
        success: false,
        message: 'User not found',
        statusCode: 404
      });
    }

    let plan = { planName: 'Regular', price: 0, duration: 1, _id: user.assignedPlanID };
    if (user.planName !== 'Regular') {
      plan = user.assignedPlanID;
      if (!plan) {
        return apiResponse(res, {
          success: false,
          message: 'Subscription plan not found',
          statusCode: 404
        });
      }
    }

    const daysUsed = user.planStartDate ? getDaysUsed(user.planStartDate) : 0;
    const totalDays = plan.duration * 30; // Assuming 30 days per month
    const remainingDays = Math.max(0, totalDays - daysUsed);

    const totalAmountWithGst = Math.round(plan.price * (1 + GST_RATE));

    const responseData = {
      userId: user._id.toString(),
      planId: plan._id.toString(),
      planName: user.planName,
      originalPrice: plan.price,
      gstPercentage: GST_RATE * 100,
      totalAmount: totalAmountWithGst,
      daysUsed,
      remainingDays,
      planStartDate: user.planStartDate,
      planExpiryDate: user.planExpiryDate
    };

    return apiResponse(res, {
      success: true, 
      message: 'Plan details retrieved successfully',
      data: responseData,
      statusCode: 200
    });
  } catch (error) {
    console.error('Error fetching plan details:', error);
    return apiResponse(res, {
      success: false,
      message: 'Internal server error',
      statusCode: 500
    });
  }
};

module.exports = { changePlan, getPlanDetails };