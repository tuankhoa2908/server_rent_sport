const fs = require("fs");
const asyncHandler = require("express-async-handler");
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Field = require('../models/field.model');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'uploads', // Folder name in Cloudinary
        allowed_formats: ['jpeg', 'png', 'jpg'], // Accepted file types
    },
});


const upload = multer({ storage });

module.exports = {
    uploadImages: asyncHandler(async (req, res) => {
        try {
            const { id } = req.params;
            console.log(1);
            // Multer processes the uploaded file and makes it available in req.file
            if (!req.file) {
                return res.status(400).json({ message: "No file uploaded" });
            }

            // Cloudinary will automatically handle the upload through Multer
            const uploadedFile = req.file;
            console.log(uploadedFile);
            const updateField = await Field.findByIdAndUpdate(id,
                { $push: { images: uploadedFile.path } },
                { new: true }
            );
            if (!updateField) {
                return res.status(404).json({ message: 'Field not found' });
            }
            // Respond with the Cloudinary URL of the uploaded image
            res.status(200).json({
                message: "Image uploaded successfully",
                data: {
                    url: uploadedFile.path, // Cloudinary URL
                    id: uploadedFile.filename, // File ID in Cloudinary
                },
            });
        } catch (error) {
            console.error("Error uploading image:", error);
            res.status(500).json({ message: "Image upload failed", error: error.message });
        }
    }),
    upload,
}