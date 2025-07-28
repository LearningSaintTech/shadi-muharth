const ProfileVerification = require("../../../user-panel/models/sendVerification/sendVerification");
const {apiResponse} = require("../../../utils/apiResponse");
const userAuth = require("../../../user-panel/models/userAuth/Auth");
const {exportToCsv} = require("../../../utils/exportToCsv");
const Notification = require("../../../common/models/notification");
const admin = require("../../../config/firebaseAdmin");
const mongoose = require("mongoose");


const getAllVerifications = async (req, res) => {
  try {
    // Aggregate data from ProfileVerification, userpersonalinfos, and userprofileimages
    const verifications = await ProfileVerification.aggregate([
      // Lookup userPersonalInfo for receiver
      {
        $lookup: {
          from: 'userpersonalinfos',
          localField: 'receiverId',
          foreignField: 'userId',
          as: 'personalInfo'
        }
      },
      // Unwind personalInfo to treat it as a single object
      { $unwind: { path: '$personalInfo', preserveNullAndEmptyArrays: true } },

      // Lookup userProfileImage for receiver
      {
        $lookup: {
          from: 'userprofileimages',
          localField: 'receiverId',
          foreignField: 'userId',
          as: 'profileImage'
        }
      },
      // Unwind profileImage to treat it as a single object
      { $unwind: { path: '$profileImage', preserveNullAndEmptyArrays: true } },

      // Lookup userAuth for receiver's mobileNumber
      {
        $lookup: {
          from: 'userauths',
          localField: 'receiverId',
          foreignField: '_id',
          as: 'userAuth'
        }
      },
      // Unwind userAuth to treat it as a single object
      { $unwind: { path: '$userAuth', preserveNullAndEmptyArrays: true } },

      // Project the desired fields
      {
        $project: {
          id: '$_id',
          senderId: 1,
          receiverId: 1,
          status: '$receiver_status',
          isdocumentsUploaded: 1,
          createdAt: 1,
          receiver: {
            name: { $ifNull: ['$personalInfo.fullName', 'N/A'] },
            email: { $ifNull: ['$personalInfo.emailId', 'N/A'] },
            phoneNumber: { $ifNull: ['$userAuth.mobileNumber', 'N/A'] },
            profileImage: { $ifNull: ['$profileImage.profileImageUrl', 'N/A'] }
          }
        }
      }
    ]);

    return apiResponse(res, {
      success: true,
      message: 'Verifications retrieved successfully',
      data: { verifications },
      statusCode: 200
    });
  } catch (error) {
    console.error('Error fetching verifications:', error);
    return apiResponse(res, {
      success: false,
      message: 'Server error while fetching verifications',
      statusCode: 500
    });
  }
};

//get-user-by-id

const getUserVerificationById = async (req, res) => {
    try {
        const { id } = req.params; // Assuming the user ID is passed as a URL parameter

        // Validate the ID
        if (!id) {
            return apiResponse(res, {
                success: false,
                message: 'User ID is required',
                data: null,
                statusCode: 400,
            });
        }

        // Aggregate data from userAuth, userPersonalInfo, userProfessionalInfo, userReligiousInfo, userProfileImage, and userdocument
        const users = await userAuth.aggregate([
            // Match the specific user by ID
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(id)
                }
            },
            // Lookup userPersonalInfo
            {
                $lookup: {
                    from: 'userpersonalinfos', // Collection name in MongoDB
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'personalInfo'
                }
            },
            // Unwind personalInfo to treat it as a single object
            {
                $unwind: { path: '$personalInfo', preserveNullAndEmptyArrays: true }
            },
            // Lookup userProfessionalInfo
            {
                $lookup: {
                    from: 'userprofessionalinfos', // Collection name in MongoDB
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'professionalInfo'
                }
            },
            // Unwind professionalInfo
            {
                $unwind: { path: '$professionalInfo', preserveNullAndEmptyArrays: true }
            },
            // Lookup userReligiousInfo
            {
                $lookup: {
                    from: 'userreligioninfos', // Collection name in MongoDB
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'religiousInfo'
                }
            },
            // Unwind religiousInfo
            {
                $unwind: { path: '$religiousInfo', preserveNullAndEmptyArrays: true }
            },
            // Lookup userProfileImage
            {
                $lookup: {
                    from: 'userprofileimages', // Collection name in MongoDB
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'profileImage'
                }
            },
            // Unwind profileImage
            {
                $unwind: { path: '$profileImage', preserveNullAndEmptyArrays: true }
            },
            // Lookup userdocument
            {
                $lookup: {
                    from: 'userdocuments', // Collection name in MongoDB
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'documents'
                }
            },
            // Unwind documents
            {
                $unwind: { path: '$documents', preserveNullAndEmptyArrays: true }
            },
            // Project the desired fields
            {
                $project: {
                    _id: 1,
                    fullName: '$personalInfo.fullName',
                    email: '$personalInfo.emailId',
                    mobileNumber:'$mobileNumber',
                    address: {
                        $concat: [
                            { $ifNull: ['$personalInfo.block', ''] },
                            {
                                $cond: [
                                    {
                                        $and: [
                                            { $ne: ['$personalInfo.block', ''] },
                                            { $ne: ['$personalInfo.district', ''] }
                                        ]
                                    }, ', ', ''
                                ]
                            },
                            { $ifNull: ['$personalInfo.district', ''] },
                            {
                                $cond: [
                                    {
                                        $and: [
                                            { $ne: ['$personalInfo.district', ''] },
                                            { $ne: ['$personalInfo.city', ''] }
                                        ]
                                    }, ', ', ''
                                ]
                            },
                            { $ifNull: ['$personalInfo.city', ''] },
                            {
                                $cond: [
                                    {
                                        $and: [
                                            { $ne: ['$personalInfo.city', ''] },
                                            { $ne: ['$personalInfo.state', ''] }
                                        ]
                                    }, ', ', ''
                                ]
                            },
                            { $ifNull: ['$personalInfo.state', ''] }
                        ]
                    },
                    dob: '$personalInfo.dob',
                    gender: '$personalInfo.gender',
                    diet: '$personalInfo.diet',
                    height: '$personalInfo.height',
                    martialStatus: '$personalInfo.martialStatus',
                    company: '$professionalInfo.company',
                    jobTitle: '$professionalInfo.jobTitle',
                    religion: '$religiousInfo.religion',
                    community: '$religiousInfo.community',
                    subcommunity: '$religiousInfo.subcommunity',
                    highestQualification: '$professionalInfo.highestQualification',
                    college: '$professionalInfo.college',
                    annualIncome: '$professionalInfo.annualIncome',
                    companyType: '$professionalInfo.workDetails.companyType',
                    position: '$professionalInfo.workDetails.position',
                    companyName: '$professionalInfo.workDetails.companyName',
                    profileImage: { $ifNull: ['$profileImage.profileImageUrl', 'N/A'] },
                    planName: '$planName',
                    highschoolMarksheet: { $ifNull: ['$documents.highschoolmarksheetimageUrl', 'Not Uploaded'] },
                    intermediateMarksheet: { $ifNull: ['$documents.intermediatemarksheetimageUrl', 'Not Uploaded'] },
                    highestQualificationMarksheet: { $ifNull: ['$documents.highestqualificationmarksheetimageUrl', 'Not Uploaded'] },
                    aadharFront: { $ifNull: ['$documents.aadharfontimageUrl', 'Not Uploaded'] },
                    aadharBack: { $ifNull: ['$documents.aadharbackimageUrl', 'Not Uploaded'] },
                    pancard: { $ifNull: ['$documents.pancardimageUrl', 'Not Uploaded'] },
                    instagramAccountId: { $ifNull: ['$documents.instagramAccountId', 'Not Uploaded'] },
                    facebookAccountId: { $ifNull: ['$documents.facebookAccountId', 'Not Uploaded'] },
                }
            }
        ]);

        // Check if user was found
        if (!users || users.length === 0) {
            return apiResponse(res, {
                success: false,
                message: 'User not found',
                data: null,
                statusCode: 404,
            });
        }

        // Return the user data (first element since we're querying by ID)
        return apiResponse(res, {
            success: true,
            message: 'User retrieved successfully',
            data: users[0],
            statusCode: 200,
        });

    } catch (error) {
        console.error('Error retrieving user by ID:', error);
        return apiResponse(res, {
            success: false,
            message: 'Internal server error',
            data: null,
            statusCode: 500,
        });
    }
};

//get-csv-file
const exportVerificationsToCsv = async (req, res) => {
  try {
    // Aggregate data from ProfileVerification, userpersonalinfos, and userprofileimages
    const verifications = await ProfileVerification.aggregate([
      // Lookup userPersonalInfo for receiver
      {
        $lookup: {
          from: 'userpersonalinfos',
          localField: 'receiverId',
          foreignField: 'userId',
          as: 'personalInfo'
        }
      },
      // Unwind personalInfo to treat it as a single object
      { $unwind: { path: '$personalInfo', preserveNullAndEmptyArrays: true } },

      // Lookup userProfileImage for receiver
      {
        $lookup: {
          from: 'userprofileimages',
          localField: 'receiverId',
          foreignField: 'userId',
          as: 'profileImage'
        }
      },
      // Unwind profileImage to treat it as a single object
      { $unwind: { path: '$profileImage', preserveNullAndEmptyArrays: true } },

      // Lookup userAuth for receiver's mobileNumber
      {
        $lookup: {
          from: 'userauths',
          localField: 'receiverId',
          foreignField: '_id',
          as: 'userAuth'
        }
      },
      // Unwind userAuth to treat it as a single object
      { $unwind: { path: '$userAuth', preserveNullAndEmptyArrays: true } },

      // Project only the desired fields
      {
        $project: {
          receiverName: { $ifNull: ['$personalInfo.fullName', 'N/A'] },
          receiverEmail: { $ifNull: ['$personalInfo.emailId', 'N/A'] },
          receiverPhone: { $ifNull: [{ $toString: '$userAuth.mobileNumber' }, 'N/A'] },
          status: '$receiver_status'
        }
      }
    ]);

    // Define CSV columns
    const columns = [
      { key: 'receiverName', header: 'Verification User Name' },
      { key: 'receiverPhone', header: 'Contact' },
      { key: 'receiverEmail', header: 'Email' },
      { key: 'status', header: 'Status' }
    ];

    exportToCsv(res, verifications, columns, 'verifications_export.csv');

  } catch (error) {
    console.error('Error exporting verifications to CSV:', error);
    return apiResponse(res, {
      success: false,
      message: 'Internal server error',
      data: null,
      statusCode: 500,
    });
  }
};


//send notifcaiton for uploading documents

const sendUploadDocumentNotification = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.userId;
    

    // Validate input
    if (!receiverId || !mongoose.Types.ObjectId.isValid(receiverId)) {
      return apiResponse(res, {
        success: false,
        message: 'Valid Receiver ID is required',
        statusCode: 400
      });
    }

    // Check if verification exists for the receiver
    const verification = await ProfileVerification.findOne({ receiverId }).select('receiverId receiver_status');
    if (!verification) {
      return apiResponse(res, {
        success: false,
        message: 'Verification record not found for this receiver',
        statusCode: 404
      });
    }

    // Check if receiver exists and get their FCM tokens
    const receiver = await userAuth.findById(receiverId).select('fcmToken mobileNumber');
    if (!receiver) {
      return apiResponse(res, {
        success: false,
        message: 'Receiver not found',
        statusCode: 404
      });
    }

    // Check if notification for this verification already exists
    const existingNotification = await Notification.findOne({
      receiverId,
      type: 'document_upload',
      title: 'Document Upload Request'
    });
    if (existingNotification) {
      return apiResponse(res, {
        success: false,
        message: 'Document upload notification already sent to this user',
        statusCode: 400
      });
    }

    // Create notification record
    const notification = await Notification.create({
      senderId,
      receiverId,
      title: 'Document Upload Request',
      message: 'Please upload your verification documents.',
      type: 'document_upload',
      read: false
    });

    // Update verification status to 'notification sent'
    verification.receiver_status = 'notification sent';
    await verification.save();

    // Send push notification to receiver if they have FCM tokens
    if (receiver.fcmToken && receiver.fcmToken.length > 0) {
      const topic = `/topics/user-${receiverId}`;

      // Subscribe receiver's FCM tokens to their topic
      try {
        await admin.messaging().subscribeToTopic(receiver.fcmToken, topic);
        console.log(`Subscribed ${receiver.fcmToken.length} tokens to topic: ${topic}`);
      } catch (subscriptionError) {
        console.error('Error subscribing to topic:', subscriptionError);
      }

      // Send notification to the topic
      const message = {
        notification: {
          title: 'Document Upload Request',
          body: 'Please upload your documents for verification.',
        },
        topic: `user-${receiverId}`
      };

      try {
        const response = await admin.messaging().send(message);
        console.log(`Notification sent to topic user-${receiverId}: ${response}`);
      } catch (notificationError) {
        console.error('Error sending notification:', notificationError);
        // Continue with success response even if notification fails
      }
    }

    return apiResponse(res, {
      success: true,
      message: 'Document upload notification sent successfully',
      data: {
        notification: {
          id: notification._id,
          receiverId: notification.receiverId,
          createdAt: notification.createdAt
        },
        verification: {
          id: verification._id,
          receiver_status: verification.receiver_status
        }
      },
      statusCode: 200
    });
  } catch (error) {
    console.error('Send document upload notification error:', error);
    return apiResponse(res, {
      success: false,
      message: 'Server error while sending document upload notification',
      statusCode: 500
    });
  }
};

module.exports = {getAllVerifications,getUserVerificationById,exportVerificationsToCsv,sendUploadDocumentNotification}