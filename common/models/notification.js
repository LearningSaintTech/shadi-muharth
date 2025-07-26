const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserAuth',
    required: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserAuth',
    required: true,
    index: true // Optimize queries by receiverId
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'interest' // Default for interest notifications
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Unique index for interest notifications
notificationSchema.index({ senderId: 1, receiverId: 1, type: 1 }, { unique: true, partialFilterExpression: { type: 'interest' } });

module.exports = mongoose.model('Notification', notificationSchema);