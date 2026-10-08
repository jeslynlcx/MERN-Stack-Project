const express = require('express')
const router = express.Router()
const ActivityLogController = require('../controllers/ActivityLogController')
const auth = require('../middlewares/auth')

router.use(express.json())

router.get("/", auth.authenticate, ActivityLogController.getAllLogs)
router.get("/my-feedback", auth.authenticate, ActivityLogController.getMyLogs)
router.post("/", auth.authenticate, ActivityLogController.addLog)
router.delete("/:id", auth.authenticate, ActivityLogController.deleteLog)

module.exports = router