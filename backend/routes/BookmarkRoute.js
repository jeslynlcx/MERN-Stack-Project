const express = require('express')
const router = express.Router()
const BookmarkController = require('../controllers/BookmarkController')
const auth = require('../middlewares/auth')

router.use(express.json())

router.get("/", auth.authenticate, BookmarkController.getAllBookmarks)
router.get("/:id", auth.authenticate, BookmarkController.getUserBookmarks)
router.post("/", auth.authenticate, BookmarkController.updateReadingProgress)
router.patch("/:id", auth.authenticate, BookmarkController.updateReadingProgress)
router.delete("/:id", auth.authenticate, BookmarkController.deleteBookmark)

module.exports = router