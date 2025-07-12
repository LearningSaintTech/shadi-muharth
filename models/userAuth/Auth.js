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
  isEmailVerified:{
    type:Boolean,
    default:false
  },
  role:{
    type:String,
    default:"user"
  },
  isProfileComplete:{
    type:Boolean,
    default:false
  },
  assignedPlanID:{
    type: mongoose.Schema.Types.ObjectId,
     ref: 'SubscriptionPlan' ,
      default: new mongoose.Types.ObjectId(),
  },
  // planStartDate:{
  //   type:Date
  // },
  // planExpiryDate:{
  //   type:Date
  // }
},{timestamps: true});

module.exports = mongoose.model('UserAuth', userAuthSchema);