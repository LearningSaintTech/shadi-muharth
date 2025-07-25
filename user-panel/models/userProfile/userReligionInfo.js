const mongoose = require('mongoose');

const userReligionInfoSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "userAuth",
        required: true,
    },
    religion: {
        type: String,
        required: true,
    },
    community: {
        type: String,
        required: true,
    },
    subcommunity: {
        type: String,
        required: true,
    },
    casteNoBar: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('userReligionInfo', userReligionInfoSchema);