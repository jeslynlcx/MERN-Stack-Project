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
        
        if (req.body.contentImageUrls) { // If URL was entered
            contentImageUrls = req.body.contentImageUrls
                .split(",")  //Splits the single long string into an array by 逗号
                .map(url => url.trim())  //Loops through each URL in the array and removes any extra spaces at beginning or end using .trim()
                .filter(url => url !== "") //Removes any empty strings from the array
        }

        if (  // Cover upload
            req.files &&
            req.files.coverImage &&
            req.files.coverImage[0]
        ) {
            coverImageUrl =
                `/uploads/${req.files.coverImage[0].filename}`
        }

        if (  // Content image uploads
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
        res.status(400).json({error: error.message})
    }
}

exports.updateContent = async (req, res) => {
    try {
        const { id } = req.params
        
        // 1. Find existing content to preserve unedited pages
        const existingContent = await Content.findById(id)
        if (!existingContent) {
            return res.status(404).json({error: "Content not found"})
        }

        const updateData = {
            name: req.body.name || existingContent.name,
            description: req.body.description || existingContent.description,
            category: req.body.category || existingContent.category,
            totalPages: req.body.totalPages || existingContent.totalPages,
            status: req.body.status || existingContent.status,
            coverImageUrl: existingContent.coverImageUrl,
            contentImageUrls: [...existingContent.contentImageUrls] // Start with existing pages
        }

        // Cover image updates
        if (req.body.coverImageUrl) {  
            updateData.coverImageUrl = req.body.coverImageUrl
        }
        if (req.files && req.files.coverImage && req.files.coverImage[0]) {
            updateData.coverImageUrl = `/uploads/${req.files.coverImage[0].filename}`
        }

        // If user sends an explicit array or comma-separated list of page URLs to sync
        if (req.body.contentImageUrls) {
            const incomingUrls = req.body.contentImageUrls
                .split(",")
                .map(url => url.trim()) //update existing slots or add new ones, keeping placeholders for files
            updateData.contentImageUrls = incomingUrls
        }

        //  Merge newly uploaded files into their specific page index if provided
        if (req.files && req.files.contentImages && req.files.contentImages.length > 0) {
            let fileIndex = 0
            req.files.contentImages.forEach(file => {
                const newFilepath = `/uploads/${file.filename}`
                // Find where the placeholder or file name was designated, or push/replace
                const placeholderIndex = updateData.contentImageUrls.findIndex(url => url.includes(file.originalname) || url.includes("temp-file"))
                if (placeholderIndex !== -1) {
                    updateData.contentImageUrls[placeholderIndex] = newFilepath
                } else {
                    updateData.contentImageUrls.push(newFilepath)
                }
            })
        }
        // Filter out empty strings
        updateData.contentImageUrls = updateData.contentImageUrls.filter(url => url !== "")
        const updatedContent = await Content.findByIdAndUpdate(
            id, updateData, { new: true, runValidators: true }
        )
        res.json(updatedContent)
    } catch (error) {
        console.error(error)
        res.status(400).json({error: error.message})
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