const express = require('express')
const router = express.Router()
const UserController = require('../controllers/UserController')
const auth = require('../middlewares/auth')

router.use(express.json())

router.post("/register", UserController.register)
router.post("/login", UserController.login)
router.get("/", auth.authenticate, UserController.getAllUsers)
router.get("/:id", auth.authenticate, UserController.getUsersById);
router.put("/:id", auth.authenticate, UserController.updateUser);

module.exports = router