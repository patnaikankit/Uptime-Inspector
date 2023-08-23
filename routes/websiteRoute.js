const express = require("express")
const { validateAccessToken } = require("../middlewares/userMiddleware")
const { addWebsiteController, deleteWebsiteController, getAllWebsiteController } = require("../controllers/websiteController")

const router = express.Router()

router.post("/create-website", validateAccessToken, addWebsiteController)
router.delete("/delete-website/:webId", validateAccessToken, deleteWebsiteController)
router.get("/", validateAccessToken, getAllWebsiteController)

module.exports = router
