const express = require('express');
const router = express.Router();

const { user } = require('../controllers/index.controller');
const middleware = require('../middleware/authMiddleware');

//POST routes
router.post('/register', user.createUser);
router.post('/login', user.loginUser);
router.post('/admin-login', user.loginAdmin);
router.post('/seller-login', user.loginSeller);
router.post('/update-password', middleware.verifyToken, user.changePassword);
router.post('/forgot-password-token', user.forgotPasswordToken);
router.post('/update-seller/:id', middleware.verifyToken, middleware.isAdmin, user.changeRoleToSeller);
router.post('/update-profile/:id', middleware.verifyToken, user.updateProfileUser);

// GET routes
router.get('/log-out', user.logoutUser);
router.get('/refresh', user.handleRefreshToken);
router.get('/all-renter', middleware.verifyToken, middleware.isAdmin, user.getAllRenter);
router.get('/all-seller', middleware.verifyToken, middleware.isAdmin, user.getAllSeller);
router.get('/:id', user.getUser);

// DELETE routes
router.delete('/:id', user.deleteUser);

//PUT routes
router.put("/reset-password/:token", user.resetPassword);
router.post('/block-user/:id', middleware.verifyToken, middleware.isAdmin, user.blockUser);
router.post('/unblock-user/:id', middleware.verifyToken, middleware.isAdmin, user.unblockUser);


module.exports = router;