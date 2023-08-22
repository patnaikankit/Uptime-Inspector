const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    tokens: {
        accessToken: {
            token: String,
            expireAt: Date
        },
        refreshToken: {
            token: String,
            expireAt: Date
        }
    }
}, { timestamps: true })

const userModel =  mongoose.model("User", userSchema)

module.exports = userModel;