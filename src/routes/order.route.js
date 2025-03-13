const express = require('express');
const router = express.Router();

const { order } = require('../controllers/index.controller');
const middleware = require('../middleware/authMiddleware');

// POST route
router.post('/create-order', middleware.verifyToken, order.createOrder);
router.post('/update', order.getAllOrder);
router.post('/check-status', order.checkStatus);

// GET routes
router.get('/all', middleware.verifyToken, middleware.isAdmin, order.getAllOrder);
router.get('/get-history-user/:id', middleware.verifyToken, order.getOrderUser);
router.get('/get-order-seller/:id', middleware.verifyToken, order.getOrderSeller);

// DELETE routes
router.delete('/delete-order/:id', middleware.verifyToken, order.deleteOrderfromUser);
module.exports = router;