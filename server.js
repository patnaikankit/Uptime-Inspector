const dotenv = require("dotenv")
dotenv.config()
const express = require("express")
const cors = require("cors")
const userRoute = require("./routes/userRoute")
const websiteRoute = require("./routes/websiteRoute")
const { connectDB } = require("./config/db")

const app = express()

app.use(cors())
app.use(express.json())

connectDB

app.use("/api/v1/user", userRoute)
app.use("/api/v1/website", websiteRoute)

const PORT = process.env.PORT || 3000

app.listen(PORT, (req, res) => {
    console.log(`Server is listening on port ${PORT}`);
})