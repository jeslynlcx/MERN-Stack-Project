const ActivityLog = require('../models/ActivityLog')

exports.getAllLogs = async (req, res) => {
    try {
        const logs = await ActivityLog.find({}).populate('userId')
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