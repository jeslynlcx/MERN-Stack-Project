const express = require('express')
const app = express()
const PORT = 2406
const mongoose = require('mongoose')
const path = require('path')
const cors = require('cors')
const UserRoute = require('./routes/UserRoute')
const ContentRoute = require('./routes/ContentRoute')
const CategoryRoute = require('./routes/CategoryRoute')
const BookmarkRoute = require('./routes/BookmarkRoute')
const ActivityLogRoute = require('./routes/ActivityLogRoute')

require('dotenv').config()

mongoose 
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("MongoDB Connected")
    })
    .catch(err => console.log(err))

const corsHandler = cors ({
    origin: "*",
    methods: "GET,POST,PUT,DELETE,PATCH",
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200,
    preflightContinue: true
})

app.use(corsHandler)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
app.use(express.static('public'))
app.use("/users", UserRoute)
app.use("/contents", ContentRoute)
app.use("/categories", CategoryRoute)
app.use("/bookmarks",BookmarkRoute)
app.use("/activitylogs", ActivityLogRoute)

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`)
})