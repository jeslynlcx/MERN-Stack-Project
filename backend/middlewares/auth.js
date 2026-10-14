const jwt = require('jsonwebtoken')
const User = require('../models/User')

exports.authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization //verity authorization exist and its a string
        if (!authHeader || typeof authHeader !== 'string') { //to prevent splitting of token
            return res.status(401).json({
                error: "Authorization token is missing"
            })
        }

        const token = authHeader.split(" ")[1] //spilt Bearer <token> [0][1] check is it empty token
        if (!token) {
            return res.status(401).json({ error: "Malformed token format" }) //to prevent empty token
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY) //decode the JWT using our secret key 
        const user = await User.findOne({ username: decoded.username}) //check the database to ensure the user actually exists
        if (!user) throw new Error("No user found!")
        req.user = user //user get back from database after find the id ， attach the result
        next()
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: "Token has expired" }); //logout when token expired
        }
        res.status(401).json({ error: error.message })    
    }
}