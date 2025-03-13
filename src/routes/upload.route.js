const express = require('express');
const router = express.Router();

const { upload, uploadImages } = require('../controllers/upload.controller');
// const uploadImages = require('../middleware/uploadImages');

router.post("/image/:id", upload.single('image'), uploadImages);

module.exports = router;