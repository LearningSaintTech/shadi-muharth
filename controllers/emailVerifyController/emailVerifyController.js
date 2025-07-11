const UserAuth = require('../../models/userAuth/Auth');
const UserPersonalInfo = require('../../models/userProfile/userPersonalinfo');
const crypto = require('crypto');
const OTP = require('../../models/OTP/OTP');
const { apiResponse } = require('../../utils/apiResponse');

// Generate 4-digit OTP
const generateOTP = () => {
  return crypto.randomInt(1000, 9999).toString();
};

// Controller to send OTP for email verification
const sendEmailOTP = async (req, res) => {
    try {
        const userId = req.userId
        const { email } = req.body;
        
        const user = await UserAuth.findById(userId);
        if (user.isEmailVerified) {
            return apiResponse(res, {
                success: false,
                message: 'Email is already verified',
                statusCode: 400
            });
        }

        const otp = generateOTP();
        
        // Save OTP to database
        await OTP.create({
            email,
            otp
        });

        console.log(`OTP ${otp} sent to ${email}`); 

        return apiResponse(res, {
            message: 'OTP sent to email successfully',
            data:{ otp } 
        });
    } catch (error) {
        console.error('Error sending email OTP:', error);
        return apiResponse(res, {
            success: false,
            message: 'Internal server error',
            statusCode: 500
        });
    }
};

// Controller to verify email OTP
const verifyEmailOTP = async (req, res) => {
    try {
        const userId = req.userId;
        const { email, otp } = req.body;

        console.log('Verifying OTP for:', { userId, email, otp });

        // Find OTP record
        const otpRecord = await OTP.findOne({ email, otp });
        console.log('OTP record found:', otpRecord);

        if (!otpRecord) {
            console.log('No matching OTP found for:', { email, otp });
            return apiResponse(res, {
                success: false,
                message: 'Invalid or expired OTP',
                statusCode: 400
            });
        }

        // Update email verification status in UserAuth
        const user = await UserAuth.findByIdAndUpdate(
            userId,
            { isEmailVerified: true },
            { new: true }
        );
        console.log('User after email verification update:', user);

        if (!user) {
            console.log('User not found with ID:', userId);
            return apiResponse(res, {
                success: false,
                message: 'User not found',
                statusCode: 404
            });
        }

        // Delete used OTP
        const deleted = await OTP.deleteOne({ _id: otpRecord._id });
        console.log('OTP deleted:', deleted);

        return apiResponse(res, {
            message: 'Email verified successfully',
            data: {
                id: user._id,
                email,
                isEmailVerified: user.isEmailVerified
            }
        });
    } catch (error) {
        console.error('Error verifying email OTP:', error);
        return apiResponse(res, {
            success: false,
            message: 'Internal server error',
            statusCode: 500
        });
    }
};



// Controller to resend OTP for email verification
const resendEmailOTP = async (req, res) => {
    try {
        const { email } = req.body;
        

        // Delete any existing OTP for this email to avoid duplicates
        await OTP.deleteOne({ email });

        const otp = generateOTP();
        
        // Save new OTP to database
        await OTP.create({
            email,
            otp
        });

        console.log(`Resent OTP ${otp} to ${email}`); 

        return apiResponse(res, {
            message: 'OTP resent to email successfully',
            data: {otp}
        });
    } catch (error) {
        console.error('Error resending email OTP:', error);
        return apiResponse(res, {
            success: false,
            message: 'Internal server error',
            statusCode: 500
        });
    }
};



module.exports = {sendEmailOTP,verifyEmailOTP,resendEmailOTP}