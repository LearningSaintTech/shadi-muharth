const express = require('express');
const router = express.Router();
const {uploadTestimonials } = require('../controllers/uploadTestimonialsController/uploadTestimonialsController'); 
const {verifyToken} = require("../../Middlewares/authMiddleware");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });



router.post('/upload-testimonials', verifyToken,upload.single('testimonialImage'),uploadTestimonials);

module.exports = router;