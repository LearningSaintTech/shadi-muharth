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
  isProfileVerified:{
     type:Boolean,
     default:false
  },
  assignedPlanID:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubscriptionPlan' ,
    default: new mongoose.Types.ObjectId("686f66a82a28156c14144533"),
  },
  planName:{
    type:String,
    default:"Regular"
  },
  paymentStatus:{
    type:Boolean,
    default:false
  },
  planStartDate:{
    type:Date
  },
  planExpiryDate:{
    type:Date
  }
},{timestamps: true});


// Middleware to set plan dates when isProfileComplete becomes true
userAuthSchema.pre('save', function(next) {
  if (this.isModified('isProfileComplete') && this.isProfileComplete === true && !this.planStartDate) {
    const now = new Date();
    this.planStartDate = now;
    
    // Set expiry date to one month from now
    const expiryDate = new Date(now);
    expiryDate.setMonth(now.getMonth() + 1);
    this.planExpiryDate = expiryDate;
  }
  next();
});

module.exports = mongoose.model('UserAuth', userAuthSchema);