const express = require("express")
const { registerController, loginController, generateAccesstoken } = require("../controllers/userController")
const router = express.Router()

router.post("/signup", registerController)
router.post("/login", loginController)
router.post("/new-token", generateAccesstoken)

module.exports = router