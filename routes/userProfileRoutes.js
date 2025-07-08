const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const {createUserPersonalInfo , getUserPersonalInfo , updateUserPersonalInfo,getUserProfileSummary} = require('../controllers/userProfileControllers/userpersonalinfoController');
const {createUserReligionInfo,getUserReligionInfo,updateUserReligionInfo} = require("../controllers/userProfileControllers/userReligionInfoController");
const {createUserProfessionalInfo,getUserProfessionalInfo,updateUserProfessionalInfo} = require("../controllers/userProfileControllers/userprofessionalinfoController");
const { createUserProfileImage, updateUserProfileImage, getUserProfileImage } = require("../controllers/userProfileControllers/userprofileImageController");
const {uploadImages,updateImage,deleteImage,getImageGallery} = require("../controllers/userProfileControllers/usergalleryController");
const {saveUserPaymentDetails, getUserPaymentDetails, updateUserPaymentDetails} = require("../controllers/userProfileControllers/userpaymentdetailController");
const {verifyToken} = require("../authMiddleware/authMiddleware");



// Route for  create-personalInfo
router.post('/create-personalInfo',verifyToken, createUserPersonalInfo);

// Route for get-personalInfo
router.get('/get-personalInfo',verifyToken,getUserPersonalInfo)

//Route for update-personalInfo
router.put("/update-personalInfo",verifyToken,updateUserPersonalInfo);





// Route for  create-religionInfo
router.post('/create-religionInfo',verifyToken, createUserReligionInfo);

// Route for get-religionInfo
router.get('/get-religionInfo',verifyToken,getUserReligionInfo)

//Route for update-religionInfo
router.put("/update-religionInfo",verifyToken,updateUserReligionInfo);




// Route for  create-professionalInfo
router.post('/create-professionalInfo',verifyToken, createUserProfessionalInfo);

// Route for get-professionalInfo
router.get('/get-professionalInfo',verifyToken,getUserProfessionalInfo)

//Route for update-professionalInfo
router.put("/update-professionalInfo",verifyToken,updateUserProfessionalInfo);



// Route for  create-userProfileImage
router.post('/create-userProfileImage',verifyToken, upload.single('profileImage'), createUserProfileImage);

// Route for get-userProfileImage
router.get('/get-userProfileImage',verifyToken,getUserProfileImage)

//Route for update-userProfileImage
router.put("/update-userProfileImage",verifyToken, upload.single('profileImage'),updateUserProfileImage);




//Route for upload-imageGallery
router.post('/create-imageGallery', verifyToken, upload.array('images', 6), uploadImages);

//Route for update-imageGallery
router.put('/update-imageGallery/:imageIndex', verifyToken, upload.single('image'), updateImage);

//Route for delete-imageGallery
router.delete('/delete-imageGallery/:imageIndex', verifyToken, deleteImage);

//Route for get-imageGallery
router.get('/get-imageGallery', verifyToken, getImageGallery);



//Route for profile-summary
router.get("/profile-summary",verifyToken,getUserProfileSummary)




//Route for save-userPaymentDetails
router.post("/save-userPaymentDetails",verifyToken,saveUserPaymentDetails);

//Route for  get-userPaymentDetails
router.get("/get-userPaymentDetails",verifyToken,getUserPaymentDetails);

//Route for  update-userPaymentDetails
router.patch("/update-userPaymentDetails",verifyToken,updateUserPaymentDetails);


module.exports = router;