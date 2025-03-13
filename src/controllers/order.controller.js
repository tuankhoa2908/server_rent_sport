const Order = require('../models/order.model');
const Time = require('../models/time.model');
const User = require('../models/user.model');
const Coupon = require('../models/coupon.model');
const Field = require('../models/field.model');
const Transaction = require('../models/transaction.model');

const asyncHandler = require('express-async-handler');
const { validateMongoDbId } = require('../utils/validateMongodbId');
const { sendEmail } = require('./email.controller');

module.exports = {
    checkStatus: asyncHandler(async (req, res) => {
        //body={id_renter,id_field,day_rent,start_time,end_time}
        const data = req.body;
        console.log(data);
        validateMongoDbId(data.id_renter);
        validateMongoDbId(data.id_field);
        const start_time_min = '06:00:00.000';
        currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        if (new Date(data.day_rent) < currentDate) {
            return res.json({ message: "Ngày thuê không phù hợp" });
        };
        const startTimeOrder = new Date(`${data.day_rent}T${data.start_time}:00Z`);
        const endTimeOrder = new Date(`${data.day_rent}T${data.end_time}:00Z`);
        if (startTimeOrder >= endTimeOrder)
            return res.json({ message: "Thời gian bắt đầu phải lớn hơn thời gian kết thúc" });
        const list_time = await Time.find({
            id_field: data.id_field,
            day_rent: data.day_rent,
        }, {
            start_time: 1,
            end_time: 1,
        });
        for (let i = 0; i < list_time.length; i++) {
            if (startTimeOrder < list_time[i].end_time && endTimeOrder > list_time[i].start_time) {
                console.log(list_time[i]);
                return res.status(200).send({
                    status: false,
                    message: "Vui lòng chọn khung thời gian khác, đã có người đặt trước bạn",
                    list_time,
                })
            }
        };
        const price = await Field.findById(data.id_field);
        const timeOrder = (endTimeOrder - startTimeOrder) / (1000 * 60 * 60);
        const isWeekend = [0, 6].includes(new Date(data.day_rent).getDay());
        data.isWeekend = isWeekend;
        const priceField = timeOrder * (isWeekend ? price.price_per_hour_weekend : price.price_per_hour);
        data.priceField = priceField;
        data.timeOrder = timeOrder;
        return res.status(200).json({
            status: true,
            message: "Thời gian đã chọn có thể được đặt trước.",
            data,
            list_time
        });
    }),


    createOrder: asyncHandler(async (req, res) => {
        // body = {field_order, renter, day_rent, time_start, time_end
        // payment_fee, coupon}
        const data = req.body;
        console.log(data);
        validateMongoDbId(data.id_renter);
        validateMongoDbId(data.id_field);
        // Check gia tien
        let newBalance = 0;
        const user = await User.findById(data.id_renter);
        if (user.balance_wallet < data.deposit) {
            return res.json({
                status: false,
                message: "Số dư không đủ để trả tiền cọc."
            });
        } else {
            newBalance = user.balance_wallet - data.deposit;
        }
        console.log(newBalance);
        // cac dieu kien thoa ma~n -> cap nhat database
        if (!data.id_coupon) data.id_coupon = "";
        console.log(data);
        try {
            // tao don hang
            const newOrder = await Order.create({
                id_field: data.id_field,
                id_renter: data.id_renter,
                day_rent: data.day_rent,
                start_time: `${data.day_rent}T${data.start_time}:00.000Z`,
                end_time: `${data.day_rent}T${data.end_time}:00.000Z`,
                price_field: data.price_field,
                after_discount: data.after_discount,
                coupon: data?.id_coupon,
                deposit: data.deposit,
            });
            // console.log(1);
            // cap nhat so du nguoi thue
            const updateBalanceUser = await User.findByIdAndUpdate(data.id_renter, {
                balance_wallet: newBalance,
            }, {
                new: true,
            });

            // cap nhat so du chu san
            const owner_field = await Field.findById(data.id_field, {
                owner_field: 1,
            });
            console.log(owner_field);
            const updateBalanceSeller = await User.findByIdAndUpdate(owner_field.owner_field, {
                $inc: { balance_wallet: data.deposit * 0.9 }
            }, { new: true });
            // cap nhat so du admin
            const id_admin = process.env.ID_ADMIN;
            const updateBalanceAdmin = await User.findByIdAndUpdate(id_admin, {
                $inc: { balance_wallet: data.deposit * 0.1 }
            }, { new: true })
            // Luu lich su giao dich
            const newTransaction = await Transaction.create({
                transaction_owner: data.id_renter,
                type_transaction: "Transfer",
                receiver: owner_field.owner_field,
                amount: data.deposit * 0.9
            });
            const newTransaction2 = await Transaction.create({
                transaction_owner: data.id_renter,
                type_transaction: "Transfer",
                receiver: process.env.ID_ADMIN,
                amount: data.deposit * 0.1
            });

            const newTime = await Time.create({
                id_renter: data.id_renter,
                id_field: data.id_field,
                day_rent: data.day_rent,
                start_time: `${data.day_rent}T${data.start_time}:00.000Z`,
                end_time: `${data.day_rent}T${data.end_time}:00.000Z`,
            })

            // cap nhat so luong coupon
            if (data.id_coupon != "") {
                console.log(1);
                const updateCoupon = await Coupon.findOneAndUpdate({ code: data.id_coupon }, {
                    $inc: {
                        number_use: -1,
                    }
                }, {
                    new: true,
                });
            }
            res.json({
                newOrder,
                status: true,
                message: `New balance is ${newBalance}`,
            },
            );
            console.log(1);
            const content = `Đây là thư tự động từ hệ thống đặt thuê sân thể thao RENT SPORT. Vui lòng kiểm tra lại các thông tin sau: 
            Ngày thuê: ${data.day_rent}, thời gian từ ${data.start_time}-${data.end_time}
            Bạn đã thanh toán ${data.deposit} VND tiền cọc. `;
            const dataEmail = {
                to: user.email,
                subject: "Kiểm tra thông tin đơn hàng của bạn từ RENT SPORT",
                html: content,
                text: 'Hey User'
            }
            sendEmail(dataEmail);
        } catch (error) {
            throw new Error(error);
        }
    }),

    getAllOrder: asyncHandler(async (req, res) => {
        try {
            const orders = await Order.find()
                .populate('id_renter')
                .populate('id_field')
            res.status(200).json(orders)
        } catch (error) {
            throw new Error(error)
        }
    }),

    getOrder: asyncHandler(async (req, res) => {
        const { id_order } = req.params;
        try {
            const order = await Order.findById(id_order);
            res.status(200).json(order);
        } catch (error) {
            throw new Error(error);
        }
    }),

    getOrderField: asyncHandler(async (req, res) => {
        const { id_field } = req.params;
        try {
            const orders = await Order.find({ field_order: id_field });
            res.status(200).json(orders);
        } catch (error) {
            throw new Error(error)
        }
    }),

    getOrderSeller: asyncHandler(async (req, res) => {
        const { id } = req.params;
        try {
            const orders = await Order.find().populate('id_field').populate('id_renter');
            let ordersUser = [];
            orders.forEach(order => {
                if (order.id_field.owner_field == id) {
                    ordersUser.push(order);
                }
            })
            res.json(ordersUser);
        } catch (error) {
            throw new Error(error);
        }
    }),

    getOrderUser: asyncHandler(async (req, res) => {
        const { id } = req.params;
        validateMongoDbId(id);
        try {
            const orders = await Order.find({ id_renter: id }).populate('id_field').populate('id_renter');
            res.status(200).json(orders);
        } catch (error) {
            throw new Error(error)
        }
    }),

    deleteOrderfromUser: asyncHandler(async (req, res) => {
        const { id } = req.params;
        validateMongoDbId(id);
        try {
            const deleteOrder = await Order.findByIdAndDelete(id);
            if (!deleteOrder) return res.json({
                status: false,
                message: 'Không tìm thấy dữ liệu thuê sân cho đơn này của bạn',
            });
            res.status(200).json({
                status: true,
                message: 'Đơn thuê sân của bạn đã được xóa thành công',
            })
        } catch (error) {
            throw new Error(error);
        }
    })
}