const mongoose = require('mongoose');
const { uploadMultipleImages } = require('../../../utils/s3Functions'); 
const UserDocuments = require("../../models/documentVerification/documentsVerification");
const { apiResponse } = require('../../../utils/apiResponse');

// Upload Documents API
const uploadDocuments = async (req, res) => {
  try {
    const userId = req.userId; 
    const files = req.files; 

    // Validate required files
    const requiredFields = [
      'highschoolmarksheet',
      'intermediatemarksheet',
      'highestqualificationmarksheet',
      'aadharfront',
      'aadharback',
      'pancard'
    ];

    const missingFields = requiredFields.filter(field => !files[field]);
    if (missingFields.length > 0) {
      return apiResponse(res, {
        success: false,
        message: `Missing required files: ${missingFields.join(', ')}`,
        statusCode: 400
      });
    }

    // Generate unique file names with userId, timestamp, and original filename
    const timestamp = Date.now();
    const fileNames = requiredFields.reduce((acc, field) => {
      const file = files[field][0];
      acc[field] = `user/documents/${userId}/${field}_${timestamp}_${file.originalname}`;
      return acc;
    }, {});

    // Prepare files array for upload
    const filesToUpload = requiredFields.map(field => files[field][0]);
    const fileNamesArray = requiredFields.map(field => fileNames[field]);

    // Upload files to S3
    const fileUrls = await uploadMultipleImages(filesToUpload, fileNamesArray);

    // Create document object for MongoDB
    const documentData = {
      userId,
      highschoolmarksheetimageUrl: fileUrls[0],
      intermediatemarksheetimageUrl: fileUrls[1],
      highestqualificationmarksheetimageUrl: fileUrls[2],
      aadharfontimageUrl: fileUrls[3],
      aadharbackimageUrl: fileUrls[4],
      pancardimageUrl: fileUrls[5],
      instagramAccountId: req.body.instagramAccountId || '',
      facebookAccountId: req.body.facebookAccountId || '',
      isdocumentsVerified: false
    };

    // Check if user already has documents
    const existingDocuments = await UserDocuments.findOne({ userId });
    if (existingDocuments) {
      return apiResponse(res, {
        success: false,
        message: 'User documents already exist',
        statusCode: 400
      });
    }

    // Save to MongoDB
    const userDocuments = new UserDocuments(documentData);
    await userDocuments.save();

    return apiResponse(res, {
      success: true,
      message: 'Documents uploaded successfully',
      data: userDocuments,
      statusCode: 201
    });
  } catch (error) {
    console.error('Error uploading documents:', error);
    return apiResponse(res, {
      success: false,
      message: 'Failed to upload documents',
      data: { error: error.message },
      statusCode: 500
    });
  }
  
};

module.exports = { uploadDocuments };