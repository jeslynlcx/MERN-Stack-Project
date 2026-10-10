const express = require('express')
const router = express.Router()
const CommentController = require('../controllers/CommentController')
const auth = require('../middlewares/auth')

router.get('/', CommentController.getAllComments)
router.post('/', auth.authenticate, CommentController.addNewComment)
router.delete('/:id', auth.authenticate, CommentController.deleteComment)

main = router
module.exports = router