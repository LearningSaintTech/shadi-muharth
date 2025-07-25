const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  mobileNumber: { type: String, default: null },
  otp: { type: Number, required: true },
  email: {
    type: String,
    default: null
  },
  createdAt: { type: Date, default: Date.now, expires: 300 } // OTP expires in 5 minutes
});

module.exports = mongoose.model('otpSchema', otpSchema);