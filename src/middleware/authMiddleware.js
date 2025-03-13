const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

module.exports = {
    verifyToken: asyncHandler(async (req, res, next) => {
        try {
            let token;
            if (req?.headers?.authorization?.startsWith('Bearer')) {
                token = req.headers.authorization.split(" ")[1];
                try {
                    if (token) {
                        const decoded = jwt.verify(token, process.env.JWT_SECRET);
                        const user = await User.findById(decoded?.id);
                        req.user = user;
                        next();
                    }
                } catch (error) {
                    throw new Error("Not Authorization token expired, Please login again");
                }
            } else {
                throw new Error("There is no token attached to header");
            }
        } catch (error) {
            throw new Error(error)
        }
    }),

    isAdmin: asyncHandler(async (req, res, next) => {
        const { email } = req.user;
        const adminUser = await User.findOne({ email });
        if (adminUser.role !== "admin") {
            throw new Error("You are not admin");
        } else {
            next();
        }
    }),

    isSeller: asyncHandler(async (req, res, next) => {
        const { email } = req.user;
        const sellerUser = await User.findOne({ email });
        if (sellerUser.role !== "seller") {
            throw new Error("You are not seller");
        } else {
            next();
        }
    }),

    isNotUser: asyncHandler(async (req, res, next) => {
        const { email } = req.user;
        const notUser = await User.findOne({ email });
        if (notUser.role === "user") {
            throw new Error("You dont have premission.");
        } else {
            next();
        }
    }),
    isActiveField: asyncHandler(async (req, res, next) => {
        const { id } = req.field;
        const findField = await Field.findById(id);
        if (findField.status !== 'Available') {
            throw new Error("This Field not available");
        }
        else {
            next();
        }
    })
}
