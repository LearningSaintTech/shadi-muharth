// chat.model.js
const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  conversationId: {
    type: String,
    required: true,
    index: true // Add index for faster queries
  },
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
  message: {
    type: String
  },
  mediaUrl: {
    type: String
  },
  mediaType: {
    type: String,
    enum: ['image', 'video', 'voice', null],
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true // Add index for sorting
  },
  readStatus: {
    type: Boolean,
    default: false
  }
});

// Ensure unique conversationId for each sender-receiver pair
chatSchema.index({ conversationId: 1 }, { unique: true });

module.exports = mongoose.model('Chat', chatSchema);