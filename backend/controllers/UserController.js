const User = require("../models/User")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

require("dotenv").config()

exports.register = async (req,res) => {
    try {
        const user = new User(req.body)
        await user.save()
        res.status(201).json({ message: "User registered successfully" })
    } catch (error) {
        res.status(400).json ({ error: error.message })
    }
}

exports.login = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username })
        if(!user || !user.comparePassword(req.body.password)) {
            throw new Error ("Invalid username or password")
        }
        const token = jwt.sign({ userId: user._id, username: user.username, role: user.role }, process.env.JWT_SECRET_KEY, { expiresIn: process.env.JWT_EXPIRES_IN }
        )
        res.json ({ 
            token, 
            role: user.role, 
            username: user.username,
            userId: user._id
        })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

exports.getAllUsers = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ error: "Access denied. Administrator privileges required." })
        }
        const users = await User.find().select('-password')
        return res.status(200).json(users)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

exports.getUsersById = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.params.id })
        if (!user) return res.status(404).json({ error: "User not found" })
        res.json(user)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params
        const updateUser = await User.findOneAndUpdate({ _id: id }, req.body, { new: true })
        if (!updateUser) return res.status(404).json({ error: "User not found" })
        res.json(updateUser)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params
        const deleted = await User.findByIdAndDelete({ _id: id })
        if (!deleted) return res.status(404).json({ error: "User not found" })
        res.status(204).send()
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}