const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const UserSchema = mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    avatarUrl: {
        type: String
    }
})

UserSchema.pre('save', function (next) { //Tells Mongoose run this function automatically before (pre) User document saved to database
    if(!this.isModified('password')){ // This checks if the password field was modified
        next   //If the user is just updating their profile info not their password, it skips hashing
    }
    this.password = bcrypt.hashSync(this.password, +process.env.BCRYPT_SALT_ROUNDS) //if pass modified replace text to hash, '+' turn variable to number
    next
})

UserSchema.methods.comparePassword = function (password) { //function that you can call on any User whenever a user tries to log in
    return bcrypt.compareSync(password, this.password) //Use bcrypt to compare the plain-text password that typed at login form
}     // against (this.password) stores in database

const User = mongoose.model('User', UserSchema)
module.exports = User