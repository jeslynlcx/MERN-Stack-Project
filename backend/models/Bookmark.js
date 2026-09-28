const { Schema, model } = require("mongoose")

const BookmarkSchema = new Schema ({
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
    lastReadPage: {
      type: Number,
      default: 1,
      min: 1,
    },
    isLiked: {
      type: Boolean,
      default: false,
    },
    lastAccessed: {
      type: Date,
      default: Date.now,
    }
})

BookmarkSchema.index({ userId: 1, contentId: 1 }, { unique: true })

const Bookmark = model("Bookmark", BookmarkSchema)
module.exports = Bookmark