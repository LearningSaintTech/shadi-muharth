const mongoose = require('mongoose');

const userInterestSchema = new mongoose.Schema({
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
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Ensure a user cannot send multiple interests to the same receiver
userInterestSchema.index({ senderId: 1, receiverId: 1 }, { unique: true });

module.exports = mongoose.model('UserInterest', userInterestSchema);