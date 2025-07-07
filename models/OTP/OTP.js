const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  mobileNumber: { type: String, required: true },
  otp: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 } // OTP expires in 5 minutes
});

module.exports = mongoose.model('otpSchema', otpSchema);