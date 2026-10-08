const ActivityLog = require('../models/ActivityLog')

exports.getAllLogs = async (req, res) => {
    try {
        const logs = await ActivityLog.find({}).populate('userId')
        res.json(logs)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

exports.getMyLogs = async (req, res) => {
    try {
        const userId = req.user.userId || req.user._id
        const logs = await ActivityLog.find({ userId })
            .sort({ createdAt: -1 }) // Newest first
        res.json(logs)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

exports.addLog = async (req, res) => {
    try {
        const newLog = new ActivityLog(req.body)
        await newLog.save()
        res.status(201).json(newLog)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

exports.deleteLog = async (req, res) => {
    try {
        const { id } = req.params
        const deleted = await ActivityLog.findByIdAndDelete({ _id: id })
        if (!deleted) return res.status(404).json({ error: "Comments not found" })
        res.status(204).send()
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}