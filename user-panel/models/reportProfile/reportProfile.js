const mongoose = require('mongoose');

const reportuserSchema = new mongoose.Schema({
    reporterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserAuth',
        required: true
    },
    reportedUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserAuth',
        required: true
    },
    superadminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'superAdminAuth',
        required: true
    },
});

module.exports = mongoose.model('ReportUser', reportuserSchema);