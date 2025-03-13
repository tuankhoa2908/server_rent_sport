const mongoose = require('mongoose');

var fieldSchema = new mongoose.Schema({
    name_field: {
        type: String,
        required: true,
    },
    type_field: {
        type: String,
        required: true,
        enum: ["football", 'badminton', 'pickle-ball', 'ping-pong', 'tennis', 'basketball'],
    },
    status: {
        type: String,
        required: true,
        enum: ['Available', 'Not Available', 'Wait For Authenticated', 'Blocked'],
        default: 'Wait For Authenticated',
    },
    max_player: {
        type: Number,
    },
    address_field: {
        type: String,
        required: true,
    },
    address_google: {
        type: String,
        require: true,
    },
    district: {
        type: String,
        require: true,
        enum: ['Hoang Mai', 'Cau Giay', 'Dong Da', "Tay Ho", 'Hai Ba Trung', 'Ba Dinh', 'Thanh Xuan']
    },
    owner_field: {
        type: mongoose.Schema.Types.ObjectId, ref: "User",
        required: true,
    },
    price_per_hour: {
        type: Number,
        required: true,
    },
    price_per_hour_weekend: {
        type: Number,
    },
    describle: {
        type: String,
    },
    sub_describle: {
        type: String,
    },
    images: {
        type: Array,
    },
    ratings: [
        {
            star: Number,
            comment: String,
            postBy: {
                type: mongoose.Schema.Types.ObjectId, ref: "User"
            },
        }
    ],
    totalRatings: {
        type: String,
        default: 0,
    }
}, {
    timeseries: true
})

module.exports = mongoose.model('Field', fieldSchema);