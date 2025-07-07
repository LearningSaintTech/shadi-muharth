const mongoose = require('mongoose');

const userPersonalInfoSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "userAuth",
        required: true,
    },

    profileFor: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        required: true,
        enum: ["Male", "Female"]
    },
    country: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    fullName: {
        type: String,
        required: true,
    },
    dob: {
        type: Date,
        required: true,
    },
    emailId: {
        type: String,
        required: true,
    },
    martialStatus: {
        type: String,
        required: true,
    },
    height: {
        type: String,
        required: true,
    },
    diet: {
        type: String,
        required: true,
    }
});

module.exports = mongoose.model('userPersonalInfo', userPersonalInfoSchema);