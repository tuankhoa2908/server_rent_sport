const User = require('../models/user.model');
const Transaction = require('../models/transaction.model');
const { validateMongoDbId } = require('../utils/validateMongodbId');
const asyncHandler = require('express-async-handler');

module.exports = {
    // Add Money
    addMoney: asyncHandler(async (req, res) => {
        const data = req.body;
        validateMongoDbId(data.id);
        try {
            const update_balance_user = await User.findByIdAndUpdate(data.id, {
                $inc: { balance_wallet: data.amount }
            },
                { new: true }
            );
            const storage_trans = await Transaction.create({
                transaction_owner: data.id,
                type_transaction: "Deposit",
                amount: data.amount,
                receiver: data.id,
                date: new Date().getTime(),
            })
            res.status(200).json({ message: "Nap tien thanh cong.", storage_trans })
        } catch (error) {
            throw new Error(error)
        }
    }),

    withdraw: asyncHandler(async (req, res) => {
        const data = req.body;
        validateMongoDbId(data.id);
        try {
            const update_balance_user = await User.findByIdAndUpdate(data.id, {
                $inc: { balance_wallet: -data.amount }
            }, {
                new: true
            })
            res.status(200).json("Rut tien thanh cong")
        } catch (error) {
            throw new Error(error)
        }
    }),

    // Lich su giao dich
    getHistoryTransaction: asyncHandler(async (req, res) => {
        const { id } = req.params;
        validateMongoDbId(id);
        console.log(id);
        try {
            const historyTrans = await Transaction.find(
                {
                    $or: [
                        { transaction_owner: id },
                        { receiver: id }
                    ]
                }
            ).populate('transaction_owner', 'full_name').populate('receiver', 'full_name');
            console.log(historyTrans);
            res.json(historyTrans);
        } catch (error) {
            throw new Error(error)
        }
    }),

    // Tat ca giao dich
    getAllTransaction: asyncHandler(async (req, res) => {
        try {
            const transaction = await Transaction.find()
                .populate('transaction_owner')
                .populate('receiver');
            res.status(200).json(transaction);
        } catch (error) {
            throw new Error(error)
        }
    })
}