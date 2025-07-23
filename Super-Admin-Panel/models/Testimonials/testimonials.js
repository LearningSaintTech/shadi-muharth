const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
    testmonialsUrl: {
        type: String,
        required: true,
    },
    couplesName: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('testimonial', testimonialSchema);