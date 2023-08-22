const mongoose = require("mongoose")

const connectDB = mongoose
                    .connect(process.env.MONGO_URL)
                    .then(() => {
                        console.log(`Database is connected at ${mongoose.connection.host}`);
                    })
                    .catch((err) => {
                        console.log("Error -> ", err);
                    })

module.exports = {
    connectDB
}