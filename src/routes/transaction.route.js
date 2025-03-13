const express = require('express');
const router = express.Router();

const { transaction } = require('../controllers/index.controller');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// POST routes
router.post('/nap-tien', verifyToken, transaction.addMoney);
router.post('/withdraw', verifyToken, transaction.withdraw);

// GET routes
router.get('/all', verifyToken, isAdmin, transaction.getAllTransaction);
router.get('/:id', verifyToken, transaction.getHistoryTransaction)


module.exports = router;