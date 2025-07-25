const mongoose = require('mongoose');

const userdocumentsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "userAuth",
        required: true,
    },
    highschoolmarksheetimageUrl: {
        type: String,
        required: true,
    },
    intermediatemarksheetimageUrl:{
        type: String,
        required: true,
    },
    highestqualificationmarksheetimageUrl:{
        type: String,
        required: true,
    },
    aadharfontimageUrl:{
        type: String,
        required: true,
    },
    aadharbackimageUrl:{
        type: String,
        required: true,
    },
    pancardimageUrl:{
        type: String,
        required: true,
    },
    instagramAccountId:{
        type: String,
    },
    facebookAccountId:{
        type: String,
    },
    isdocumentsVerified:{
        type:Boolean,
        default:false
    }
});

module.exports = mongoose.model('userdocument', userdocumentsSchema);