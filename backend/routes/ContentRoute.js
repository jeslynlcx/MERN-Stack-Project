const express = require('express')
const router = express.Router()
const ContentController = require('../controllers/ContentController')
const auth = require('../middlewares/auth')

router.use(express.json())

router.get("/", ContentController.getAllContents)
router.get("/:id", ContentController.getContentById)
router.post("/", auth.authenticate, ContentController.addNewContent)
router.patch("/:id", auth.authenticate, ContentController.updateContent)
router.delete("/:id", auth.authenticate, ContentController.deleteContents)

module.exports = router