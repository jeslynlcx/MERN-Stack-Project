const express = require('express')
const router = express.Router()
const ActivityLogController = require('../controllers/ActivityLogController')
const auth = require('../middlewares/auth')

router.use(express.json())

router.get("/", auth.authenticate, ActivityLogController.getAllLogs)
router.post("/", auth.authenticate, ActivityLogController.addLog)

module.exports = router