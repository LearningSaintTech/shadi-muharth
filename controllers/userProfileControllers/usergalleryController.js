const mongoose = require('mongoose');
const UserImageGallery =require("../../models/userProfile/userImageGallery");
const UserAuth = require("../../models/userAuth/Auth");
const { uploadImage, deleteFromS3 } = require('../../utils/s3Functions');
const { apiResponse } = require('../../utils/apiResponse');
const path = require('path');

const uploadImages = async (req, res) => {
  try {
    const userId = req.userId;
    const files = req.files;

    if (!files || files.length === 0) {
      return apiResponse(res, {
        success: false,
        message: 'No files uploaded',
        statusCode: 400
      });
    }

    let gallery = await UserImageGallery.findOne({ userId });
    const currentImageCount = gallery ? gallery.imageGallery.length : 0;
    if (currentImageCount + files.length > 6) {
      return apiResponse(res, {
        success: false,
        message: `Cannot upload ${files.length} images. Maximum 6 images allowed, you already have ${currentImageCount}.`,
        statusCode: 400
      });
    }

    const fileUrls = await Promise.all(
      files.map(async (file) => {
        const fileName = `user/gallery/${userId}/${Date.now()}-${path.basename(file.originalname)}`;
        return await uploadImage(file, fileName);
      })
    );

    if (gallery) {
      gallery.imageGallery.push(...fileUrls);
      await gallery.save();
    } else {
      gallery = await UserImageGallery.create({
        userId,
        imageGallery: fileUrls
      });
    }

    //profile complete is true
    await UserAuth.findByIdAndUpdate(userId, { isProfileComplete: true });

    return apiResponse(res, {
      message: 'Images uploaded successfully',
      data: { imageGallery: gallery.imageGallery }
    });
  } catch (error) {
    console.error('Upload error:', error);
    return apiResponse(res, {
      success: false,
      message: 'Server error while uploading images',
      statusCode: 500
    });
  }
};


const getImageGallery = async (req, res) => {
  try {
    const userId = req.userId;
    const gallery = await UserImageGallery.findOne({ userId }).select('imageGallery');

    if (!gallery) {
      return apiResponse(res, {
        success: false,
        message: 'Gallery not found',
        statusCode: 404
      });
    }

    return apiResponse(res, {
      message: 'Image gallery retrieved successfully',
      data: { imageGallery: gallery.imageGallery }
    });
  } catch (error) {
    console.error('Get gallery error:', error);
    return apiResponse(res, {
      success: false,
      message: 'Server error while retrieving image gallery',
      statusCode: 500
    });
  }
};

const updateImage = async (req, res) => {
  try {
    const userId = req.userId;
    const { imageIndex } = req.params;
    const file = req.file;

    if (!file) {
      return apiResponse(res, {
        success: false,
        message: 'No file uploaded',
        statusCode: 400
      });
    }

    const gallery = await UserImageGallery.findOne({ userId });
    if (!gallery) {
      return apiResponse(res, {
        success: false,
        message: 'Gallery not found',
        statusCode: 404
      });
    }

    if (imageIndex < 0 || imageIndex >= gallery.imageGallery.length) {
      return apiResponse(res, {
        success: false,
        message: 'Invalid image index',
        statusCode: 400
      });
    }

    const oldImageUrl = gallery.imageGallery[imageIndex];
    await deleteFromS3(oldImageUrl);

    const fileName = `user/gallery/${userId}/${Date.now()}-${path.basename(file.originalname)}`;
    const newImageUrl = await uploadImage(file, fileName);

    gallery.imageGallery[imageIndex] = newImageUrl;
    await gallery.save();

    return apiResponse(res, {
      message: 'Image updated successfully',
      data: { imageGallery: gallery.imageGallery }
    });
  } catch (error) {
    console.error('Update error:', error);
    return apiResponse(res, {
      success: false,
      message: 'Server error while updating image',
      statusCode: 500
    });
  }
};

const deleteImage = async (req, res) => {
  try {
    const userId = req.userId;
    const { imageIndex } = req.params;

    const gallery = await UserImageGallery.findOne({ userId });
    if (!gallery) {
      return apiResponse(res, {
        success: false,
        message: 'Gallery not found',
        statusCode: 404
      });
    }

    if (imageIndex < 0 || imageIndex >= gallery.imageGallery.length) {
      return apiResponse(res, {
        success: false,
        message: 'Invalid image index',
        statusCode: 400
      });
    }

    const imageUrl = gallery.imageGallery[imageIndex];
    await deleteFromS3(imageUrl);

    gallery.imageGallery.splice(imageIndex, 1);
    await gallery.save();

    return apiResponse(res, {
      message: 'Image deleted successfully',
      data: { imageGallery: gallery.imageGallery }
    });
  } catch (error) {
    console.error('Delete error:', error);
    return apiResponse(res, {
      success: false,
      message: 'Server error while deleting image',
      statusCode: 500
    });
  }
};


// Get image gallery by ID
const getImageGalleryById = async (req, res) => {
  try {
    const { id } = req.params; // Get ID from route parameters

    const gallery = await UserImageGallery.findOne({ userId: id }).select('imageGallery');
    if (!gallery) {
      return apiResponse(res, {
        success: false,
        message: 'Gallery not found',
        statusCode: 404,
      });
    }

    return apiResponse(res, {
      success: true,
      message: 'Image gallery retrieved successfully',
      data: { imageGallery: gallery.imageGallery },
      statusCode: 200,
    });
  } catch (error) {
    console.error('Get gallery by ID error:', error);
    return apiResponse(res, {
      success: false,
      message: 'Server error while retrieving image gallery',
      data: 'An unexpected error occurred',
      statusCode: 500,
    });
  }
};



module.exports={uploadImages,updateImage,deleteImage,getImageGallery,getImageGalleryById}