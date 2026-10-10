const Comment = require('../models/Comment')

// Get all comments for a specific book/content
exports.getAllComments = async (req, res) => {
    try {
        const { contentId } = req.query
        const query = contentId ? { contentId } : {}
        const comments = await Comment.find(query).populate('userId', 'username role')
        res.json(comments)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

exports.addNewComment = async (req, res) => {
    try {
        const { contentId, text } = req.body
        const userId = req.user._id 
        const newComment = new Comment({ userId, contentId, text })
        await newComment.save()
        const savedComment = await Comment.findById(newComment._id).populate('userId', 'username role')
        res.status(201).json(savedComment)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

exports.deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id)
        if (!comment) return res.status(404).json({ error: "Not found" })

        if (comment.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ error: "Unauthorized" })
        }

        await Comment.findByIdAndDelete(req.params.id)
        res.status(204).send()
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}