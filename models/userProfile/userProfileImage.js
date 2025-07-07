const mongoose = require('mongoose');

const userprofileImageSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "userAuth",
        required: true,
    },
    profileImageUrl: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model('userprofileImage', userprofileImageSchema);