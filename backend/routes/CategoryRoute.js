const express = require('express')
const router = express.Router()
const CategoryController = require('../controllers/CategoryController')
const auth = require('../middlewares/auth')

router.use(express.json())

router.get("/", auth.authenticate, CategoryController.getAllCategories)
router.get("/:id", auth.authenticate, CategoryController.getCategoryById)
router.post("/", auth.authenticate, CategoryController.addNewCategory)
router.patch("/:id", auth.authenticate, CategoryController.updateCategory)
router.delete("/:id", auth.authenticate, CategoryController.deleteCategory)

module.exports = router