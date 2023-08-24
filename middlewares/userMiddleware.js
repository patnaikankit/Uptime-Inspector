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

    // to check if an user actually exists using the provided token
    if(!user){
        res.status(422).json({
            success: false,
            message: "User doesn't Exist!"
        })
        return;
    }

    // to check if the access token present is valid or not - to check whether it has expired or not
    // if expired login using the refresh token
    const expiry = new Date(user.tokens.accessToken.expireAt);
    if(expiry < new Date()) {
        res.status(422).json({
          success: false,
          message: "Token Expired!",
        });
        return;
      }

    req.user = user
    next()
}

module.exports = {
    validateAccessToken
}