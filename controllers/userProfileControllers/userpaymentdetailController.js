const mongoose = require('mongoose');
const UserPaymentDetail = require('../../models/userProfile/userPaymentDetails');
const UserAuth = require('../../models/userAuth/Auth');
const { apiResponse } = require('../../utils/apiResponse');

// Save user payment details
const saveUserPaymentDetails = async (req, res) => {
  try {
    // Validate userId
    if (!mongoose.isValidObjectId(req.userId)) {
      return apiResponse(res, {
        success: false,
        message: 'Invalid user ID',
        statusCode: 400
      });
    }

    // Check if user exists
    const userExists = await UserAuth.findById(req.userId);
    if (!userExists) {
      return apiResponse(res, {
        success: false,
        message: 'User not found',
        statusCode: 404
      });
    }

    // Check if payment details already exist
    const existingPaymentDetails = await UserPaymentDetail.findOne({ userId: req.userId });
    if (existingPaymentDetails) {
      return apiResponse(res, {
        success: false,
        message: 'Payment details already exist',
        statusCode: 409
      });
    }

    // Validate required fields
    const { paymentMethod, cardholderName, cardNumber, expiredDate, CVV } = req.body;
    if (!paymentMethod || !cardholderName || !cardNumber || !expiredDate || !CVV) {
      return apiResponse(res, {
        success: false,
        message: 'All fields  are required',
        statusCode: 400
      });
    }

    // Validate field types
    if (typeof cardNumber !== 'number') {
      return apiResponse(res, {
        success: false,
        message: 'Card number must be a number',
        statusCode: 400
      });
    }
    if (typeof CVV !== 'number') {
      return apiResponse(res, {
        success: false,
        message: 'CVV must be a number',
        statusCode: 400
      });
    }
    if (isNaN(Date.parse(expiredDate))) {
      return apiResponse(res, {
        success: false,
        message: 'Expired date must be a valid date',
        statusCode: 400
      });
    }

    // Create and save payment details
    const userPaymentDetails = new UserPaymentDetail({
      userId: req.userId,
      paymentMethod,
      cardholderName,
      cardNumber,
      expiredDate,
      CVV
    });

    const savedPaymentDetails = await userPaymentDetails.save();

    return apiResponse(res, {
      success: true,
      message: 'Payment details saved successfully',
      data: savedPaymentDetails,
      statusCode: 201
    });
  } catch (error) {
    console.error(`Error in saveUserPaymentDetails for userId ${req.userId}:`, error);
    return apiResponse(res, {
      success: false,
      message: `Error saving payment details: ${error.message}`,
      statusCode: 500
    });
  }
};

// Get user payment details
const getUserPaymentDetails = async (req, res) => {
  try {
    // Validate userId
    if (!mongoose.isValidObjectId(req.userId)) {
      return apiResponse(res, {
        success: false,
        message: 'Invalid user ID',
        statusCode: 400
      });
    }

    // Find payment details
    const paymentDetails = await UserPaymentDetail.findOne({ userId: req.userId });
    if (!paymentDetails) {
      return apiResponse(res, {
        success: false,
        message: 'Payment details not found',
        statusCode: 404
      });
    }

    return apiResponse(res, {
      success: true,
      message: 'Payment details retrieved successfully',
      data: paymentDetails,
      statusCode: 200
    });
  } catch (error) {
    console.error(`Error in getUserPaymentDetails for userId ${req.userId}:`, error);
    return apiResponse(res, {
      success: false,
      message: `Error retrieving payment details: ${error.message}`,
      statusCode: 500
    });
  }
};

// Update user payment details
const updateUserPaymentDetails = async (req, res) => {
  try {
    // Validate userId
    if (!mongoose.isValidObjectId(req.userId)) {
      return apiResponse(res, {
        success: false,
        message: 'Invalid user ID',
        statusCode: 400
      });
    }

    // Check if user exists
    const userExists = await UserAuth.findById(req.userId);
    if (!userExists) {
      return apiResponse(res, {
        success: false,
        message: 'User not found',
        statusCode: 404
      });
    }

    // Validate fields if provided
    const { cardNumber, CVV, expiredDate } = req.body;
    if (cardNumber && typeof cardNumber !== 'number') {
      return apiResponse(res, {
        success: false,
        message: 'Card number must be a number',
        statusCode: 400
      });
    }
    if (CVV && typeof CVV !== 'number') {
      return apiResponse(res, {
        success: false,
        message: 'CVV must be a number',
        statusCode: 400
      });
    }
    if (expiredDate && isNaN(Date.parse(expiredDate))) {
      return apiResponse(res, {
        success: false,
        message: 'Expired date must be a valid date',
        statusCode: 400
      });
    }

    // Update or create payment details
    const updatedPaymentDetails = await UserPaymentDetail.findOneAndUpdate(
      { userId: req.userId },
      { $set: { userId: req.userId, ...req.body } },
      { new: true, upsert: true, runValidators: true }
    );

    return apiResponse(res, {
      success: true,
      message: 'Payment details updated successfully',
      data: updatedPaymentDetails,
      statusCode: 200
    });
  } catch (error) {
    console.error(`Error in updateUserPaymentDetails for userId ${req.userId}:`, error);
    return apiResponse(res, {
      success: false,
      message: `Error updating payment details: ${error.message}`,
      statusCode: 500
    });
  }
};

module.exports = { saveUserPaymentDetails, getUserPaymentDetails, updateUserPaymentDetails };