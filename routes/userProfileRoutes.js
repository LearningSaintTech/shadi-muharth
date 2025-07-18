const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const {createUserPersonalInfo , getUserPersonalInfo , updateUserPersonalInfo,getUserProfileSummary,getUserPersonalInfoById} = require('../controllers/userProfileControllers/userpersonalinfoController');
const {createUserReligionInfo,getUserReligionInfo,updateUserReligionInfo,getUserReligionInfoById} = require("../controllers/userProfileControllers/userReligionInfoController");
const {createUserProfessionalInfo,getUserProfessionalInfo,updateUserProfessionalInfo,getUserProfessionalInfoById} = require("../controllers/userProfileControllers/userprofessionalinfoController");
const { createUserProfileImage, updateUserProfileImage, getUserProfileImage,getUserProfileImageById } = require("../controllers/userProfileControllers/userprofileImageController");
const {uploadImages,updateImage,deleteImage,getImageGallery,getImageGalleryById} = require("../controllers/userProfileControllers/usergalleryController");
const {verifyToken} = require("../Middlewares/authMiddleware");
const {restrictAccess} = require("../Middlewares/planMiddlreware");



// Route for  create-personalInfo
router.post('/create-personalInfo',verifyToken, createUserPersonalInfo);

// Route for get-personalInfo
router.get('/get-personalInfo',verifyToken,getUserPersonalInfo)

//Route for update-personalInfo
router.put("/update-personalInfo",verifyToken,updateUserPersonalInfo);


// Route for get-personalInfo
router.get('/get-personalInfobyId/:id',verifyToken,restrictAccess("personalInfo"),getUserPersonalInfoById);



// Route for  create-religionInfo
router.post('/create-religionInfo',verifyToken, createUserReligionInfo);

// Route for get-religionInfo
router.get('/get-religionInfo',verifyToken,getUserReligionInfo)

//Route for update-religionInfo
router.put("/update-religionInfo",verifyToken,updateUserReligionInfo);

//Route for get-religionInfo-by-Id
router.get("/get-religionInfobyId/:id",verifyToken,restrictAccess("religiousInfo"),getUserReligionInfoById);




// Route for  create-professionalInfo
router.post('/create-professionalInfo',verifyToken, createUserProfessionalInfo);

// Route for get-professionalInfo
router.get('/get-professionalInfo',verifyToken,getUserProfessionalInfo)

//Route for update-professionalInfo
router.put("/update-professionalInfo",verifyToken,updateUserProfessionalInfo);

//Route for get-professionalInfo-by-Id
router.get("/get-professionalInfobyId/:id",verifyToken,restrictAccess("professionalInfo"),getUserProfessionalInfoById);



// Route for  create-userProfileImage
router.post('/create-userProfileImage',verifyToken, upload.single('profileImage'), createUserProfileImage);

// Route for get-userProfileImage
router.get('/get-userProfileImage',verifyToken,getUserProfileImage)

//Route for update-userProfileImage
router.put("/update-userProfileImage",verifyToken, upload.single('profileImage'),updateUserProfileImage);

// Route for get-userProfileImageById
router.get('/get-userProfileImagebyId/:id',verifyToken,restrictAccess("profilePhoto"),getUserProfileImageById)




//Route for upload-imageGallery
router.post('/create-imageGallery', verifyToken, upload.array('images', 6), uploadImages);

//Route for update-imageGallery
router.put('/update-imageGallery/:imageIndex', verifyToken, upload.single('image'), updateImage);

//Route for delete-imageGallery
router.delete('/delete-imageGallery/:imageIndex', verifyToken, deleteImage);

//Route for get-imageGallery
router.get('/get-imageGallery', verifyToken, getImageGallery);

//Route for get-imageGalleryById
router.get('/get-imageGallerybyId/:id', verifyToken,restrictAccess("imageGallery"), getImageGalleryById);



//Route for profile-summary
router.get("/profile-summary",verifyToken,getUserProfileSummary)




module.exports = router;