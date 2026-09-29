const express = require('express')
const router = express.Router()
const ContentController = require('../controllers/ContentController')
const auth = require('../middlewares/auth')
const multer = require('multer')

const upload = multer({ dest: 'uploads/' })
router.use(express.json())

router.get("/", auth.authenticate,ContentController.getAllContents)
router.get("/:id",auth.authenticate,  ContentController.getContentById)
router.post("/", auth.authenticate, upload.fields([{ name: 'coverImage', maxCount: 1 },{ name: 'contentImages', maxCount: 50 }]), ContentController.addNewContent)
router.patch("/:id", auth.authenticate, upload.fields([{ name: 'coverImage', maxCount: 1 },{ name: 'contentImages', maxCount: 50 }]), ContentController.updateContent)
router.delete("/:id", auth.authenticate, ContentController.deleteContents)

module.exports = router