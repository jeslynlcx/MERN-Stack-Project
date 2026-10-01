const jwt = require('jsonwebtoken')
const User = require('../models/User')

exports.authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || typeof authHeader !== 'string') {
            return res.status(401).json({
                error: "Authorization token is missing"
            });
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "Malformed token format" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
        const user = await User.findOne({ username: decoded.username})
        if (!user) throw new Error("No user found!")
        
        req.user = user
        next()
    } catch (error) {
        res.status(400).json ({ error: error.message })
    }
}