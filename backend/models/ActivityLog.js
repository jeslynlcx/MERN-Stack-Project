const { Schema, model } = require("mongoose")

const ActivityLogSchema = new Schema ({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true 
    },
    action: {
        type: String,
        required: true,
        enum: ['USER_LOGIN', 'BOOK_PUBLISHED', 'BOOK_UPDATED', 'COMMENT_DELETED', 'FEEDBACK_REVIEWED'],
    },
    details: {
        type: String,
        required: true 
    }
})

const ActivityLog = model("ActivityLog", ActivityLogSchema)
module.exports = ActivityLog