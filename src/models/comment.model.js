const mongoose = require('mongoose');

var commentSchema = new mongoose.Schema({
    field_comment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Field",
        required: true,
    },
    user_comment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    comment: {
        type: String,
        required: true,
    },
}, {
    timestamps: true
});

//Export the model
module.exports = mongoose.model('Comment', commentSchema);