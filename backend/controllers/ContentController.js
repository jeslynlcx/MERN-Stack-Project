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
        let coverImageUrl = req.body.coverImageUrl || ""

        let contentImageUrls = []

        // If URL was entered
        if (req.body.contentImageUrls) {
            contentImageUrls = req.body.contentImageUrls
                .split(",")
                .map(url => url.trim())
                .filter(url => url !== "")
        }

        // Cover upload
        if (
            req.files &&
            req.files.coverImage &&
            req.files.coverImage[0]
        ) {
            coverImageUrl =
                `/uploads/${req.files.coverImage[0].filename}`
        }

        // Content image uploads
        if (
            req.files &&
            req.files.contentImages &&
            req.files.contentImages.length > 0
        ) {
            contentImageUrls = req.files.contentImages.map(file =>
                `/uploads/${file.filename}`
            )
        }

        const newContent = new Content({
            name: req.body.name,
            description: req.body.description,
            category: req.body.category,
            coverImageUrl,
            contentImageUrls,
            totalPages: req.body.totalPages,
            status: req.body.status
        })

        await newContent.save()

        res.status(201).json(newContent)

    } catch (error) {
        console.error(error)

        res.status(400).json({
            error: error.message
        })
    }
}

exports.updateContent = async (req, res) => {
    try {
        const { id } = req.params

        const updateData = {
            name: req.body.name,
            description: req.body.description,
            category: req.body.category,
            totalPages: req.body.totalPages,
            status: req.body.status
        }

        // Cover URL
        if (req.body.coverImageUrl) {
            updateData.coverImageUrl =
                req.body.coverImageUrl
        }

        // Content image URLs
        if (req.body.contentImageUrls) {
            updateData.contentImageUrls =
                req.body.contentImageUrls
                    .split(",")
                    .map(url => url.trim())
                    .filter(url => url !== "")
        }

        // New uploaded cover
        if (
            req.files &&
            req.files.coverImage &&
            req.files.coverImage[0]
        ) {
            updateData.coverImageUrl =
                `/uploads/${req.files.coverImage[0].filename}`
        }

        // New uploaded pages
        if (
            req.files &&
            req.files.contentImages &&
            req.files.contentImages.length > 0
        ) {
            updateData.contentImageUrls =
                req.files.contentImages.map(file =>
                    `/uploads/${file.filename}`
                )
        }

        const updatedContent =
            await Content.findByIdAndUpdate(
                id,
                updateData,
                {
                    new: true,
                    runValidators: true
                }
            )

        if (!updatedContent) {
            return res.status(404).json({
                error: "Content not found"
            })
        }

        res.json(updatedContent)

    } catch (error) {
        console.error(error)

        res.status(400).json({
            error: error.message
        })
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