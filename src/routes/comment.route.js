const express = require('express');
const router = express.Router();

const { comment } = require('../controllers/index.controller');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/new', verifyToken, comment.addComment);

router.get('/list/:id', comment.getCommentField);

module.exports = router;