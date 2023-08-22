const dotenv = require("dotenv")
dotenv.config()
const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const userRoute = require("./routes/userRoute")

const app = express()

app.use(cors())
app.use(express.json())

mongoose
    .connect(process.env.MONGO_URL)
    .then(() => {
        console.log(`Database is connected at ${mongoose.connection.host}`);
    })
    .catch((err) => {
        console.log("Error -> ", err);
    })


app.use("/api/v1/user", userRoute)

const PORT = process.env.PORT || 3000

app.listen(PORT, (req, res) => {
    console.log(`Server is listening on port ${PORT}`);
})