const mongoose = require('mongoose');

var couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
    },
    name: {
        type: String,
        required: true
    },
    expiry: {
        type: Date,
        required: true,
    },
    discount: {
        type: Number,
        require: true,
    },
    number_use: {
        type: Number,
        default: 1,
    },
    describle: {
        type: String,
    },
});

//Export the model
module.exports = mongoose.model('Coupon', couponSchema);