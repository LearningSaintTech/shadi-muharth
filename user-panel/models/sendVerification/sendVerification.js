const mongoose = require('mongoose');

const profileVerificationSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserAuth',
    required: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserAuth',
    required: true
  },
   receiver_status:{
    enum:["upload documents","documents uploaded","notification sent"],
    type:String
  },
  isdocumentsUploaded:{
      type:Boolean,
      default:false
  },  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure a user cannot verify the same profile multiple times
profileVerificationSchema.index({ senderId: 1, receiverId: 1 }, { unique: true });

module.exports = mongoose.model('ProfileVerification', profileVerificationSchema);