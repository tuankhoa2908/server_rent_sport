const mongoose = require('mongoose');

var orderSchema = new mongoose.Schema({
    id_field: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Field',
        require: true,
    },
    id_renter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true,
    },
    day_rent: {
        type: Date,
        require: true,
    },
    start_time: {
        type: Date,
        require: true,
    },
    end_time: {
        type: Date,
        require: true,
    },
    status: {
        type: String,
        enum: ['booked', 'in_use', 'free', 'completed'],
        default: 'booked',
    },
    price_field: {
        type: Number,
        require: true,
    },
    coupon: {
        type: String,
    },
    after_discount: {
        type: Number,
    },
    deposit: { // tien coc 30%
        type: Number,
        require: true,
    }
}, {
    timestamps: true,
})

module.exports = mongoose.model("Order", orderSchema)