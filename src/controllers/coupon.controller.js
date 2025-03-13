const Coupon = require('../models/coupon.model');
const { validateMongoDbId } = require('../utils/validateMongodbId');
const asyncHandler = require('express-async-handler');

module.exports = {

    createCoupon: asyncHandler(async (req, res) => {
        try {
            req.body.discount = req.body.discount / 100;
            console.log(req.body);
            req.body.number_use = parseInt(req.body.number_use);
            console.log(req.body);
            const newCoupon = await Coupon.create({
                code: req.body.code,
                name: req.body.name,
                discount: req.body.discount,
                number_use: req.body.number_use,
                expiry: req.body.expiry,
                describle: req.body.describle,
            });
            res.status(200).json({
                message: "OKE",
                newCoupon
            });
        } catch (error) {
            throw new Error(error)
        }
    }),

    getAllCoupon: asyncHandler(async (req, res) => {
        try {
            const allCoupon = await Coupon.find();
            res.status(200).json(allCoupon);
        } catch (error) {
            throw new Error(error)
        }

    }),

    getCoupon: asyncHandler(async (req, res) => {
        const { id } = req.params;
        validateMongoDbId(id);
        const coupon = await Coupon.findById(id);
        res.status(200).json(coupon);
    }),

    updateCoupon: asyncHandler(async (req, res) => {
        const { id } = req.params;
        validateMongoDbId(id);
        const updateCoupon = await Coupon.findByIdAndUpdate(id, req.body, {
            new: true
        });
        res.status(200).json(updateCoupon);
    }),

    deleteCoupon: asyncHandler(async (req, res) => {
        try {
            const { id } = req.params;
            validateMongoDbId(id);
            const deleteCoupon = await Coupon.findByIdAndDelete(id);
            if (!deleteCoupon) res.status(200).json("Not Found Coupon");
            res.status(200).json(deleteCoupon);
        } catch (error) {
            throw new Error(error)
        }
    }),

    checkCoupon: asyncHandler(async (req, res) => {
        const data = req.body;
        const day = new Date(data.day_use);
        console.log(day);
        console.log(data);
        console.log(data.code);
        if (data.code != "") {
            console.log(1);
            check_coupon = await Coupon.findOne({ code: data.code });
            console.log(check_coupon.expiry)
            if (!check_coupon)
                return res.json({ message: "Không tìm thấy mã giảm giá này." });
            if (check_coupon.number_use === 0 || check_coupon.expiry < day)
                return res.json({ message: "Mã giảm giá hết hạn sử dụng" });
            res.json({
                message: "Coupon code is valid.",
                status: true,
                data: check_coupon,
            });
        } else
            res.json({
                status: false,
                message: "Coupon is not used.",
            })
    }),
}