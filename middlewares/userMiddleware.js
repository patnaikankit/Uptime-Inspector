// to access protected routes 
// we have to check if the user is trying to access a protected route he should be authenticated

const userModel = require("../models/userModel");

const validateAccessToken = async (req, res, next) => {
    // to check if a token exists or not
    const headerToken = req.headers.authorization
    if(!headerToken){
        res.status(400).json({
            success: false,
            message: "Token Not Found!"
        })
        return;
    }

    // to validate the token
    const user = await userModel.findOne({
        "tokens.accessToken.token": headerToken
    })

    if(!user){
        res.status(422).json({
            success: false,
            message: "User doesn't Exist!"
        })
        return;
    }

    req.user = user
    next()
}

module.exports = {
    validateAccessToken
}