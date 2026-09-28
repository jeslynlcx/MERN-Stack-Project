const jwt = require('jsonwebtoken')
const User = require('../models/User')

exports.authenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1]
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
        const user = await User.findOne({ username: decoded.username})
        if (!user) throw new Error("No user found!")
            req.user = user
        next()
    } catch (error) {
        res.status(400).json ({ error: error.message })
    }
}