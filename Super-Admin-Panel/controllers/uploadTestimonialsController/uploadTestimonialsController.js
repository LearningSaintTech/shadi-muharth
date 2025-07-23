const testimonial = require("../..//models/Testimonials/testimonials");
const {apiResponse} = require("../../../utils/apiResponse");
const {uploadImage} = require("../../../utils/s3Functions");


const uploadTestimonials = async (req, res) => {
  try {
    const { couplesName, address } = req.body;
    const file = req.file; 

    // Validate required fields
    if (!couplesName || !address || !file) {
      return apiResponse(res, {
        success: false,
        message: "Missing required fields: couplesName, address, or file",
        statusCode: 400,
      });
    }

    const fileName = `testimonials/${Date.now()}_${file.originalname}`;

    
    const testmonialsUrl = await uploadImage(file, fileName);

    // Create new testimonial document
    const newTestimonial = new testimonial({
      testmonialsUrl,
      couplesName,
      address,
    });

   
    const savedTestimonial = await newTestimonial.save();

    return apiResponse(res, {
      success: true,
      message: "Testimonial uploaded successfully",
      data: savedTestimonial,
      statusCode: 201,
    });
  } catch (error) {
    console.error("Error uploading testimonial:", error);
    return apiResponse(res, {
      success: false,
      message: error.message || "Failed to upload testimonial",
      statusCode: 500,
    });
  }
};

module.exports = {uploadTestimonials}