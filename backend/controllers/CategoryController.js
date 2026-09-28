const Category = require('../models/Category')

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find({})
        res.json(categories)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

exports.getCategoryById = async (req, res) => {
    try {
        const category = await Category.findOne({ _id: req.params.id })
        if (!category) return res.status(404).json({ error: "Category not found" })
        res.json(category)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

exports.addNewCategory = async (req, res) => {
    try {
        const newCategory = new Category(req.body)
        await newCategory.save()
        res.status(201).json(newCategory)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params
        const updatedCategory = await Category.findOneAndUpdate({ _id: id }, req.body, { new: true })
        if (!updatedCategory) return res.status(404).json({ error: "Category not found" })
        res.json(updatedCategory)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params
        const deletedCategory = await Category.findByIdAndDelete({ _id: id })
        if (!deletedCategory) return res.status(404).json({ error: "Category not found" })
        res.status(204).send()
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}