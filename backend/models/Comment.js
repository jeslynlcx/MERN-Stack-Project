const { Schema, model } = require("mongoose")

const CommentSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    contentId: {
        type: Schema.Types.ObjectId,
        ref: 'Content',
        required: true,
    },
    text: {
        type: String,
        required: true,
        trim: true,
    }
}, { timestamps: true })

const Comment = model("Comment", CommentSchema)
module.exports = Comment