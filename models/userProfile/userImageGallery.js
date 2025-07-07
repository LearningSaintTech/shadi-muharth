const mongoose = require('mongoose');

const userImageGallerySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "userAuth",
        required: true,
    },
    imageGallery: {
        type: [String],
    },
});

module.exports = mongoose.model('userImageGallery', userImageGallerySchema);