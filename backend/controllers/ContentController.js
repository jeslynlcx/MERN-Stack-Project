const Content = require('../models/Content')

exports.getAllContents = async (req, res) => {
    try {
        const contents = await Content.find({})
        res.json(contents)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

exports.getContentById = async (req, res) => {
    try {
        const content = await Content.findOne({ _id: req.params.id })
        if (!content) return res.status(404).json({ error: "Content not found" })
        res.json(content)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

exports.addNewContent = async (req, res) => {
    try {
        const newContent = new Content(req.body)
        await newContent.save()
        res.status(201).json(newContent)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

exports.updateContent = async (req, res) => {
    try {
        const { id } = req.params
        const updateContent = await Content.findOneAndUpdate({ _id: id }, req.body, { new: true })
        if (!updateContent) return res.status(404).json({ error: "Content not found" })
        res.json(updateContent)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

exports.deleteContents = async (req, res) => {
    try {
        const { id } = req.params
        const deleted = await Content.findByIdAndDelete({ _id: id })
        if (!deleted) return res.status(404).json({ error: "Content not found" })
        res.status(204).send()
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}