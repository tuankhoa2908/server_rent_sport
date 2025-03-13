const mongoose = require('mongoose');

var transactionSchema = new mongoose.Schema({
    transaction_owner: {
        type: mongoose.Schema.Types.ObjectId, ref: "User",
        required: true,
    },
    type_transaction: {
        type: String,
        require: true,
        enum: ['Deposit', 'Withdraw', 'Transfer']
    },
    amount: {
        type: Number,
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId, ref: "User",
    },
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Transaction', transactionSchema);