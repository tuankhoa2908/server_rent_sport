const mongoose = require('mongoose');

var timeSchema = new mongoose.Schema({
    id_renter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    id_field: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Field",
        required: true,
    },
    day_rent: {
        type: Date,
        required: true,
    },
    start_time: {
        type: Date,
        required: true,
    },
    end_time: {
        type: Date,
        required: true,
    },
}, {
    timestamps: true,
})

module.exports = mongoose.model("Time", timeSchema);