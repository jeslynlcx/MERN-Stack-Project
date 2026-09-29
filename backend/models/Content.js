const { Schema, model } = require("mongoose")

const ContentSchema = new Schema ({
    name: {
        type: String,
        required: true  
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    coverImageUrl: {
        type: String,
        required: true
    },
    contentImageUrls: [{ type: String }],
    pdfFileUrl: {
      type: String,
      // required: true,
    },
    totalPages: {
      type: Number,
      required: true,
      min: 1,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    status: {
      type: String,
      enum: ['Draft', 'Published', 'Archived'],
      default: 'Published',
    }
})

const Content = model("Content", ContentSchema)
module.exports = Content