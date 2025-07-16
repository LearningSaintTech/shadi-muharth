const UserProfileImage = require('../../models/userProfile/userProfileImage');
const { apiResponse } = require('../../utils/apiResponse');
const { uploadImage, deleteImage } = require("../../utils/s3Functions");


// Create a new user profile image
const createUserProfileImage = async (req, res) => {
    console.log("44444444444");
    const userId = req.userId;
    try {
        console.log("qqqq");
        if (!req.file) {
            console.log("111", req.file)
            return apiResponse(res, {
                success: false,
                message: 'No file provided',
                statusCode: 400
            });
        }

        // Check if profile image already exists for the user
        const existingImage = await UserProfileImage.findOne({ userId: req.userId });
        if (existingImage) {
            return apiResponse(res, {
                success: false,
                message: 'User profile image already exists',
                statusCode: 409
            });
        }

        // Upload new image to S3
        const fileName = `user/profileImage/${req.userId}/${Date.now()}-${req.file.originalname}`;
        const fileUrl = await uploadImage(req.file, fileName);
        const userProfileImage = new UserProfileImage({
            userId: req.userId,
            profileImageUrl: fileUrl
        });
        const savedImage = await userProfileImage.save();

        // Update isProfileComplete using findById and save to trigger middleware
        const user = await UserAuth.findById(userId);
        if (!user) {
            return apiResponse(res, {
                success: false,
                message: 'User not found',
                statusCode: 404
            });
        }

        if (!user.isProfileComplete) {
            user.isProfileComplete = true;
            await user.save(); 
        }

        apiResponse(res, {
            success: true,
            data: savedImage,
            message: 'User profile image created successfully',
            statusCode: 201
        });
    } catch (error) {
        apiResponse(res, {
            success: false,
            message: 'Error creating user profile image',
            data: error.message,
            statusCode: 400
        });
    }
};

// Update user profile image

const updateUserProfileImage = async (req, res) => {
    try {
        console.log('Received request to update profile image');

        if (!req.file) {
            console.log('No file provided in the request');
            return apiResponse(res, {
                success: false,
                message: 'No file provided',
                statusCode: 400
            });
        }

        console.log('File received:', req.file.originalname);

        // Check if profile image exists
        const existingImage = await UserProfileImage.findOne({ userId: req.userId });
        console.log('Existing image record:', existingImage);

        if (!existingImage) {
            console.log(`No profile image found for userId: ${req.userId}`);
            return apiResponse(res, {
                success: false,
                message: 'User profile image not found',
                statusCode: 404
            });
        }

        // Delete the existing image from S3
        console.log('Deleting existing image from S3:', existingImage.profileImageUrl);
        await deleteImage(existingImage.profileImageUrl);
        console.log('Existing image deleted successfully');

        // Upload new image to S3
        const fileName = `user/profileImage/${req.userId}/${Date.now()}-${req.file.originalname}`;
        console.log('Uploading new image to S3 with file name:', fileName);
        const fileUrl = await uploadImage(req.file, fileName);
        console.log('New image uploaded to S3:', fileUrl);

        // Update the record
        const updatedImage = await UserProfileImage.findOneAndUpdate(
            { userId: req.userId },
            { profileImageUrl: fileUrl },
            { new: true, runValidators: true }
        );
        console.log('Database record updated:', updatedImage);

        apiResponse(res, {
            success: true,
            data: updatedImage,
            message: 'User profile image updated successfully',
            statusCode: 200
        });
    } catch (error) {
        console.error('Update error:', error);
        apiResponse(res, {
            success: false,
            message: 'Error updating user profile image',
            data: error.message,
            statusCode: 400
        });
    }
};


// Get user profile image
const getUserProfileImage = async (req, res) => {
    try {
        const userProfileImage = await UserProfileImage.findOne({ userId: req.userId });
        if (!userProfileImage) {
            return apiResponse(res, {
                success: false,
                message: 'User profile image not found',
                statusCode: 404
            });
        }
        apiResponse(res, {
            success: true,
            data: userProfileImage,
            message: 'User profile image retrieved successfully',
            statusCode: 200
        });
    } catch (error) {
        apiResponse(res, {
            success: false,
            message: 'Error retrieving user profile image',
            data: error.message,
            statusCode: 500
        });
    }
};


// Get user profile image by ID 
const getUserProfileImageById = async (req, res) => {
    try {
        const { id } = req.params; // Get ID from route parameters

        // Find profile image and populate userId
        const userProfileImage = await UserProfileImage.findOne({ userId: id })
        if (!userProfileImage) {
            return apiResponse(res, {
                success: false,
                message: 'User profile image not found',
                statusCode: 404,
            });
        }

        return apiResponse(res, {
            success: true,
            data: userProfileImage,
            message: 'User profile image retrieved successfully',
            statusCode: 200,
        });
    } catch (error) {
        console.error('Get profile image by ID error:', error);
        return apiResponse(res, {
            success: false,
            message: 'Error retrieving user profile image',
            data: 'An unexpected error occurred',
            statusCode: 500,
        });
    }
};




module.exports = { createUserProfileImage, updateUserProfileImage, getUserProfileImage, getUserProfileImageById };