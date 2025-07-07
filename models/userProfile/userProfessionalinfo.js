// models/userProfile/userProfessionalInfo.js
const mongoose = require('mongoose');

const userProfessionalInfoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "userAuth",
    required: true,
  },
  highestQualification: {
    type: String,
    required: true,
  },
  college: {
    type: String,
    required: true,
  },
  annualIncome: {
    type: Number,
    required: true,
  },
  workDetails: {
    companyType: { type: String, required: true },
    position: { type: String, required: true },
    companyName: { type: String, required: true }
  }
});

module.exports = mongoose.model('userProfessionalInfo', userProfessionalInfoSchema);