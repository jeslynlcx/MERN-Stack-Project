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
        enum: ['REPORT','FEEDBACK_REVIEWED','OTHER']
    },
    details: {
        type: String,
        required: true 
    }
},{timestamps: true})

const ActivityLog = model("ActivityLog", ActivityLogSchema)
module.exports = ActivityLog