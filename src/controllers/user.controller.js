const User = require('../models/user.model');

const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const uniqid = require('uniqid');

const { generateToken, generateRefreshToken } = require('../config/jwtToken');
const { sendEmail } = require('./email.controller');
const { validateMongoDbId } = require('../utils/validateMongodbId');

module.exports = {

    //Register New Account 
    createUser: asyncHandler(async (req, res) => {
        try {
            // req.body = {email, username, password, ...}
            const data = req.body;
            console.log(data);
            const findUser = await User.findOne({ email: data.email });
            if (!findUser) {
                const newUser = await User.create(data);
                res.json({
                    message: 'User created successfully',
                    status: true,
                    newUser,
                });
            }
            else {
                throw new Error("User Already Exists");
            }
        } catch (error) {
            throw new Error(error);
        }
    }),

    // Register Seller 
    createSeller: asyncHandler(async (req, res) => {
        try {
            // req.body = {email, username, password, ...}
            const data = req.body;
            console.log(data);
            const findUser = await User.findOne({ email: data.email });
            if (!findUser) {
                const newSeller = await User.create(data);
                res.json(newSeller);
            }
            else {
                throw new Error("User Already Exists");
            }
        }
        catch (error) {
            throw new Error(error);
        }
    }),

    // Login Account Already
    loginUser: asyncHandler(async (req, res) => {
        const data = req.body;
        console.log(data);
        const findUser = await User.findOne({ username: data.username });
        if (findUser && (await findUser.isPasswordMatched(data.password))) {
            const refreshToken = generateRefreshToken(findUser?._id);
            await User.findByIdAndUpdate(findUser._id, {
                refreshToken: refreshToken,
            }, {
                new: true,
            });
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                maxAge: 72 * 60 * 60 * 1000,
            })
            res.json({
                _id: findUser?._id,
                username: findUser?.username,
                full_name: findUser?.full_name,
                email: findUser?.email,
                mobile: findUser?.mobile,
                token: generateToken(findUser?._id),
            });
        }
        else {
            throw new Error("Invalid Credentials");
        }
    }),

    // Login Account Admin
    loginAdmin: asyncHandler(async (req, res) => {
        const data = req.body;
        const findAdmin = await User.findOne({ username: data.username });
        if (findAdmin.role !== "admin") throw new Error("Not Authorised");
        if (findAdmin && (await findAdmin.isPasswordMatched(data.password))) {
            const refreshToken = generateRefreshToken(findAdmin?._id);
            await User.findByIdAndUpdate(findAdmin._id, {
                refreshToken: refreshToken,
            }, {
                new: true,
            });
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                maxAge: 72 * 60 * 60 * 1000,
            })
            res.json({
                _id: findAdmin?._id,
                full_name: findAdmin?.full_name,
                username: findAdmin?.username,
                email: findAdmin?.email,
                mobile: findAdmin?.mobile,
                token: generateToken(findAdmin?._id),
            });
        }
        else {
            throw new Error("Invalid Credentials");
        }
    }),

    // login Seller
    loginSeller: asyncHandler(async (req, res) => {
        const data = req.body;
        const findSeller = await User.findOne({ username: data.username });
        if (findSeller.role !== "seller") throw new Error("Not Authorised");
        if (findSeller && (await findSeller.isPasswordMatched(data.password))) {
            const refreshToken = generateRefreshToken(findSeller?._id);
            await User.findByIdAndUpdate(findSeller._id, {
                refreshToken: refreshToken,
            }, {
                new: true,
            });
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                maxAge: 72 * 60 * 60 * 1000,
            })
            res.json({
                _id: findSeller?._id,
                full_name: findSeller?.full_name,
                username: findSeller?.username,
                email: findSeller?.email,
                mobile: findSeller?.mobile,
                token: generateToken(findSeller?._id),
            })
        }
    }),

    // handle refresh token
    handleRefreshToken: asyncHandler(async (req, res) => {
        try {
            const cookie = req.cookies;
            if (!cookie) throw new Error("No Refresh Token in cookies");
            const refreshToken = cookie.refreshToken;
            const user = await User.findOne({ refreshToken })
            if (!user) throw new Error("No Refresh token present in db or not matched");
            jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
                if (err || user.id !== decoded.id) {
                    throw new Error("There is something wrong with refresh token");
                }
                const accessToken = generateToken(user?._id);
                res.json({ accessToken });
            })
        } catch (error) {
            throw new Error(error)
        }
    }),

    // Logout Account User
    logoutUser: asyncHandler(async (req, res) => {
        try {
            const cookie = req.cookies;
            if (!cookie?.refreshToken) throw new Error("No Refresh Token in cookies");
            const refreshToken = cookie.refreshToken;
            const user = await User.findOne({ refreshToken });
            if (!user) {
                res.clearCookie("refreshToken", {
                    httpOnly: true,
                    secure: true,
                });
                return res.sendStatus(204);
            };
            await User.findOneAndUpdate({ refreshToken }, {
                refreshToken: "",
            });
            res.clearCookie("refreshToken", {
                httpOnly: true,
                secure: true,
            });
            return res.sendStatus(204);
        } catch (error) {
            throw new Error(error)
        }
    }),

    forgotPasswordToken: asyncHandler(async (req, res) => {
        const { email } = req.body;
        console.log(email);
        const user = await User.findOne({ email });
        if (!user) throw new Error("User not found with this email");
        try {
            const token = await user.createPasswordResetToken();
            await user.save();
            const resetURL = `Hi, please follow the link to reset your Password. This link is valid till 10 minutes from now. <a href='http://localhost:8080/api/user/reset-password/${token}'>Click Here</a>`
            const data = {
                to: email,
                subject: "Forgot Password Link",
                html: resetURL,
                text: "Hey User",
            };
            sendEmail(data);
            res.json({ token, resetURL })
        } catch (error) {
            throw new Error(error);
        }
    }),

    resetPassword: asyncHandler(async (req, res) => {
        const { password } = req.body;
        const { token } = req.params;
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() },
        })
        if (!user) throw new Error("Token Expired, Please try again later");
        user.password = password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();
        res.json({ user });
    }),

    changePassword: asyncHandler(async (req, res) => {
        const { _id } = req.user;
        const { password } = req.body;
        validateMongoDbId(_id);
        const user = await User.findById(_id);
        if (password) {
            user.password = password;
            const updatePassword = await user.save();
            res.json(updatePassword);
        }
        else {
            res.json(user);
        }
    }),

    // lay thong tin ve tat ca tai khoan
    getAllRenter: asyncHandler(async (req, res) => {
        try {
            const allRenter = await User.find({
                role: "user",
            }, {
                password: 0,
            });
            res.json(allRenter);
        } catch (error) {
            throw new Error(error)
        }
    }),

    // lay thong tin ve tat ca tai khoan
    getAllSeller: asyncHandler(async (req, res) => {
        try {
            const allSeller = await User.find({
                role: "seller",
            }, {
                password: 0,
            });
            res.json(allSeller);
        } catch (error) {
            throw new Error(error)
        }
    }),

    // lay thong tin ve 1 tai khoan
    getUser: asyncHandler(async (req, res) => {
        const { id } = req.params;
        validateMongoDbId(id);
        try {
            const user = await User.findById(id);
            res.json({
                user,
            })
        } catch (error) {
            throw new Error(error)
        }
    }),

    // Block User
    blockUser: asyncHandler(async (req, res) => {
        const { id } = req.params;
        validateMongoDbId(id);
        try {
            const blockUser = await User.findByIdAndUpdate(
                id,
                {
                    isBlocked: true,
                },
                {
                    new: true,
                }
            )
            res.json({
                message: `User ${blockUser.username} had blocked`,
                status: true,
                blockUser
            })
        } catch (error) {
            throw new Error(error)
        }
    }),

    // Unblock User
    unblockUser: asyncHandler(async (req, res) => {
        const { id } = req.params;
        validateMongoDbId(id);
        try {
            const unblockUser = await User.findByIdAndUpdate(
                id,
                {
                    isBlocked: false,
                },
                {
                    new: true,
                }
            )
            res.json({
                message: `User ${unblockUser.username} had unblocked`,
                status: true,
                unblockUser
            })
        } catch (error) {
            throw new Error(error)
        }
    }),

    // change role to seller
    changeRoleToSeller: asyncHandler(async (req, res) => {
        const { id } = req.params;
        validateMongoDbId(id);
        try {
            const user = await User.findByIdAndUpdate(id, { role: "seller" }, {
                new: true
            });
            res.json({
                status: true,
                message: `User ${user.username} had changed to seller`,
                user
            })
        } catch (error) {
            throw new Error(error)
        }
    }),

    deleteUser: asyncHandler(async (req, res) => {
        const { id } = req.params;
        validateMongoDbId(id);
        try {
            const deleteUser = await User.findByIdAndDelete(id);
            res.json(deleteUser);
        } catch (error) {
            throw new Error(error)
        }
    }),

    // Update Profile User
    updateProfileUser: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const data = req.body;
        console.log(data);
        validateMongoDbId(id);
        try {
            console.log(1);
            const updateProfile = await User.findByIdAndUpdate(id, {
                full_name: req.body.full_name,
                mobile: req.body.mobile
            }, {
                new: true,
            });
            res.json({ message: "OKE", updateProfile })
        } catch (error) {
            throw new Error(error)
        }
    }),
}