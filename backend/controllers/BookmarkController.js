const Bookmark = require('../models/Bookmark')

exports.getAllBookmarks = async (req, res) => {
    try {
        const { contentId } = req.query;
        const query = contentId ? { contentId } : { userId: req.user?.id || req.user?._id };
        const bookmarks = await Bookmark.find(query).populate('contentId').populate('userId', 'username');
        res.json(bookmarks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

exports.getUserBookmarks = async (req, res) => {
    try {
        const bookmarks = await Bookmark.find({ userId: req.params.id }).populate('contentId');
        res.json(bookmarks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateReadingProgress = async (req, res) => {
    try {
        // Destructure rating and comment right alongside the other fields
        const { userId, contentId, lastReadPage, isLiked, rating, comment } = req.body;
        
        const bookmark = await Bookmark.findOneAndUpdate(
            { userId, contentId },
            { lastReadPage, isLiked, rating, comment, lastAccessed: Date.now() },
            { new: true, upsert: true }
        );
        res.json(bookmark);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

exports.deleteBookmark = async (req, res) => {
    try {
        const { id } = req.params
        const deleted = await Bookmark.findByIdAndDelete({ _id: id })
        if (!deleted) return res.status(404).json({ error: "Bookmark not found" })
        res.status(204).send()
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}