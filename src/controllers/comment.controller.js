const Comment = require('../models/comment.model');
const User = require('../models/user.model');
const { validateMongoDbId } = require('../utils/validateMongodbId');
const asyncHandler = require('express-async-handler');

module.exports = {
    // Add comment
    addComment: asyncHandler(async (req, res) => {
        const data = req.body;
        try {
            const newComment = await Comment.create({
                field_comment: data.field_comment,
                user_comment: data.user_comment,
                comment: data.comment
            })
            res.json(newComment);
        } catch (error) {
            throw new Error(error)
        }
    }),

    // Get Comment Field
    getCommentField: asyncHandler(async (req, res) => {
        const { id } = req.params;
        validateMongoDbId(id);
        try {
            const listComment = await Comment.find({
                field_comment: id,
            }).populate('user_comment');
            res.json(listComment);
        } catch (error) {
            throw new Error(error)
        }
    }),

    // Xoa comment nguoi dung 
    deleteComment: asyncHandler(async (req, res) => {
        const { id } = req.params;
        validateMongoDbId(id);
        try {
            const delCmt = await Comment.findOneAndDelete({
                _id: id
            });
            res.json({
                message: "Delete comment successfully",
                status: "OKE"
            })
        } catch (error) {
            throw new Error(error)
        }
    })
}