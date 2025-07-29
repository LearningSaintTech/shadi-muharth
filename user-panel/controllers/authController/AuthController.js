const UserAuth = require('../../models/userAuth/Auth');
const OTPModel = require('../../models/OTP/OTP');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { apiResponse } = require('../../../utils/apiResponse');
const superAdminAuth = require("../../../Super-Admin-Panel/models/auth/auth");
const mongoose = require("mongoose");

// Generate 4-digit OTP
const generateOTP = () => {
  return crypto.randomInt(1000, 9999).toString();
};

// Login Controller
const login = async (req, res) => {
  try {
    const { mobileNumber } = req.body;

    // Validate input
    if (!mobileNumber) {
      return apiResponse(res, {
        success: false,
        message: 'Mobile number is required',
        statusCode: 400
      });
    }

    // Find or create user
    let user = await UserAuth.findOne({ mobileNumber });
    if (!user) {
      user = new UserAuth({
        mobileNumber,
        isNumberVerified: false,
        role: 'user'
      });
      await user.save();
    }

    // Delete any existing OTPs for this mobile number
    await OTPModel.deleteMany({ mobileNumber });

    // Generate and save new OTP
    const otp = generateOTP();
    await OTPModel.create({ mobileNumber, otp });

    // In a real app, send OTP via SMS gateway here
    console.log(`Login OTP for ${mobileNumber}: ${otp}`);

    return apiResponse(res, {
      success: true,
      message: 'OTP sent to mobile number for login',
      data: { otp }, 
      statusCode: 200
    });
  } catch (error) {
    console.error('Login error:', error);
    return apiResponse(res, {
      success: false,
      message: 'Server error during login',
      statusCode: 500
    });
  }
};

// Verify OTP Controller
const verifyOTP = async (req, res) => {
  try {
    const { mobileNumber, otp } = req.body;
    console.log("11", mobileNumber, otp);

    // Validate input
    if (!mobileNumber || !otp) {
      return apiResponse(res, {
        success: false,
        message: 'Mobile number and OTP are required',
        statusCode: 400
      });
    }

    // Find user
    const user = await UserAuth.findOne({ mobileNumber });
    if (!user) {
      return apiResponse(res, {
        success: false,
        message: 'User not found',
        statusCode: 404
      });
    }

    // Find OTP record
    const otpRecord = await OTPModel.findOne({ mobileNumber, otp });
    console.log("ooo", otpRecord);
    if (!otpRecord) {
      return apiResponse(res, {
        success: false,
        message: 'Invalid or expired OTP',
        statusCode: 400
      });
    }

    // Update isNumberVerified to true if not already verified
    if (!user.isNumberVerified) {
      user.isNumberVerified = true;
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '7d' }
    );

    // Delete OTP
    await OTPModel.deleteOne({ _id: otpRecord._id });

    return apiResponse(res, {
      success: true,
      message: user.isNumberVerified ? 'Login successful' : 'Mobile Number verified successfully',
      data: {
        user: {
          id: user._id,
          mobileNumber: user.mobileNumber,
          role: user.role,
          isNumberVerified: user.isNumberVerified
        },
        token
      },
      statusCode: 200
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    return apiResponse(res, {
      success: false,
      message: 'Server error during OTP verification',
      statusCode: 500
    });
  }
};

// Resend OTP Controller
const resendOTP = async (req, res) => {
  try {
    const { mobileNumber } = req.body;

    // Validate input
    if (!mobileNumber) {
      return apiResponse(res, {
        success: false,
        message: 'Mobile number is required',
        statusCode: 400
      });
    }

    // Find user
    const user = await UserAuth.findOne({ mobileNumber });
    if (!user) {
      return apiResponse(res, {
        success: false,
        message: 'User not found',
        statusCode: 404
      });
    }

    // Delete any existing OTPs for this mobile number
    await OTPModel.deleteMany({ mobileNumber });

    // Generate and save new OTP
    const otp = generateOTP();
    await OTPModel.create({ mobileNumber, otp });

    
    console.log(`New OTP for ${mobileNumber}: ${otp}`);

    return apiResponse(res, {
      success: true,
      message: 'New OTP sent to mobile number',
      data: { otp }, 
      statusCode: 200
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    return apiResponse(res, {
      success: false,
      message: 'Server error during OTP resend',
      statusCode: 500
    });
  }
};



//save fcm token

const storeFcmToken = async (req, res) => {
  try {
    const userId = req.userId;
    const { fcmToken } = req.body;

    // Validate inputs
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return apiResponse(res, {
        success: false,
        message: 'Invalid or missing userId',
        statusCode: 400,
      });
    }

    if (!fcmToken || typeof fcmToken !== 'string') {
      return apiResponse(res, {
        success: false,
        message: 'Invalid or missing FCM token',
        statusCode: 400,
      });
    }

    // Check both UserAuth and superAdminAuth models
    let user = await UserAuth.findById(userId).select('fcmToken role');
    let userType = 'user';
    
    if (!user) {
      user = await superAdminAuth.findById(userId).select('fcmToken role');
      userType = 'superAdmin';
      if (!user) {
        return apiResponse(res, {
          success: false,
          message: 'User not found',
          statusCode: 404,
        });
      }
    }

    // Initialize fcmToken as an array if undefined or null
    if (!user.fcmToken || !Array.isArray(user.fcmToken)) {
      user.fcmToken = [];
    }

    // Check if token already exists
    if (user.fcmToken.includes(fcmToken)) {
      return apiResponse(res, {
        success: true,
        message: 'FCM token already stored',
        data: { fcmToken, tokenCount: user.fcmToken.length, userType },
        statusCode: 200,
      });
    }

    // Add new FCM token
    user.fcmToken.push(fcmToken);
    await user.save();

    return apiResponse(res, {
      success: true,
      message: 'FCM token stored successfully',
      data: { fcmToken, tokenCount: user.fcmToken.length, userType },
      statusCode: 201,
    });
  } catch (error) {
    console.error('Error storing FCM token:', error);
    return apiResponse(res, {
      success: false,
      message: 'Server error',
      statusCode: 500,
    });
  }
};

module.exports = { login, verifyOTP, resendOTP ,storeFcmToken};