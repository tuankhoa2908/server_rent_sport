const express = require('express');
const router = express.Router();

const user = require('./auth.route');
const field = require('./field.route');
const order = require('./order.route');
const coupon = require('./coupon.route');
const transaction = require('./transaction.route');
const upload = require('./upload.route');
const comment = require('./comment.route');

router.use('/user', user);
router.use('/field', field);
router.use('/order', order);
router.use('/coupon', coupon);
router.use('/transaction', transaction);
router.use('/upload', upload);
router.use('/comment', comment);

module.exports = router;