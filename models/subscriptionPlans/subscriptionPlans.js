const mongoose = require('mongoose');

const subscriptionPlansSchema = new mongoose.Schema(
  {
    planName: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    duration: {
      type: Number,
      required: true,
      min: 1, // Ensure duration is at least 1 month
      validate: {
        validator: Number.isInteger, // Ensure duration is an integer
        message: 'Duration must be a whole number of months.',
      },
    },
    profileDetails: {
      personalInfo: { type: Boolean, required: true, default: false },
      religiousInfo: { type: Boolean, required: true, default: false },
      professionalInfo: { type: Boolean, required: true, default: false },
    },
    profilePhoto: {
      type: Boolean,
      default: false,
      required: true,
    },
    imageGallery: {
      type: Boolean,
      default: false,
      required: true,
    },
    chat: {
      enabled: {
        type: Boolean,
        default: false,
        required: true,
      },
      messageLimit: {
        type: Number,
        default: 0,
        min: -1, // -1 for unlimited messages
      },
    },
    interestSend: {
      type: Number,
      default: 0,
      required: true,
      min: 0,
    },
    interestView: {
      type: Boolean,
      default: false,
      required: true,
    },
    personalizedMatch: {
      type: Boolean,
      default: false,
      required: true,
    },
    profileVerification: {
      type: Boolean,
      default: false,
      required: true,
    },
    whatsappSupport: {
      type: Boolean,
      default: false,
      required: true,
    },
    profilePlanTag: {
      type: Boolean,
      default: false,
      required: true,
    },
    emailAlert: {
      type: Boolean,
      default: false,
      required: true,
    },
    smsAlert: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
);

module.exports = mongoose.model('SubscriptionPlan', subscriptionPlansSchema);