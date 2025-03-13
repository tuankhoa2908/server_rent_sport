const express = require('express');
const router = express.Router();

const { coupon } = require('../controllers/index.controller');
const middleware = require('../middleware/authMiddleware');

// POST routes
router.post('/create', coupon.createCoupon);
router.post('/update', middleware.verifyToken, middleware.isAdmin, coupon.updateCoupon);

// PUT routes
router.post('/check-coupon', coupon.checkCoupon);

// DELETE routes
router.delete('/delete/:id', coupon.deleteCoupon);

// GET routes
router.get('/get/:id', coupon.getCoupon);
router.get('/all', middleware.verifyToken, middleware.isAdmin, coupon.getAllCoupon);

module.exports = router;