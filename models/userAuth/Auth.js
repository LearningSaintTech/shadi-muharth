const mongoose = require('mongoose');

const userAuthSchema = new mongoose.Schema({
  mobileNumber: {
    type: String,
    required: true,
    unique: true,
   match: [/^\+91[6-9]\d{9}$/, 'Please enter a valid Indian mobile number']
  },
  isNumberVerified:{
    type:Boolean,
    default:false
  },
  role:{
    type:String,
    default:"user"
  }
},{timestamps: true});

module.exports = mongoose.model('UserAuth', userAuthSchema);