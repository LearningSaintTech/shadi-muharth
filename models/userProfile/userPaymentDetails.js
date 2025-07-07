const mongoose = require('mongoose');

const userpaymentDetailsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "userAuth",
        required: true,
    },
    paymentMethod: {
        type: String,
        required: true,
    },
    cardholderName:{
         type: String,
        required: true,
    },
    cardNumber:{
        type:Number,
        required:true
    },
    expiredDate:{
        type:Date,
        required:true
    },
    CVV:{
        type:Number,
        required:true
    }
});

module.exports = mongoose.model('userpaymentDetail', userpaymentDetailsSchema);