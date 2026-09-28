const { Schema, model } = require("mongoose")

const CategorySchema = new Schema ({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        maxlength: 250 
    },
    isActive: {
        type: Boolean,
        default: true 
    }
})

const Category = model("Category", CategorySchema)
module.exports = Category