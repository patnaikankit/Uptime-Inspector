const bcrypt = require("bcrypt");
const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken")


// token generation
const generateToken = (data, exp) => {
    // default expiration of access token - 1day
    if(!exp){
        exp = Date.now()/1000 + 24*60*60;
    }

    const token = jwt.sign({
        exp,
        data
    }, process.env.PASS_KEY)
    return token;
}


// if an access token alredy exists then it is checked whether it is valid or not
const decodeToken = (token) => {
    let data;
    try{
        data = jwt.verify(token, process.env.PASS_KEY)
    }
    catch(err){
        console.log("Jwt Token not verified!");
    }
    return data;
}


// generating a new access token for users if the current token has expired using refresh token 
const generateAccesstoken = async (req, res) => {
    const { refreshToken } = req.body;
    if(!refreshToken){
        res.status(400).json({
          success: false,
          message: `Refresh Token Required!`,
        });
        return;
      }


      const user = await userModel.findOne({
        "tokens.refreshToken.token": refreshToken,
      });

      if (!user) {
        res.status(422).json({
          status: false,
          message: "User Not Found!",
        });
        return;
      }


    const accessTokenExp = Date.now()/1000 + 24*60*60;
    const accessToken = generateToken({
        email: user.email,
        name: user.name
    }, accessTokenExp)


    // saving the new access token in the db
    user.tokens.accessToken = {
        token: accessToken,
        expireAt: new Date(accessTokenExp*1000),
    };


    user.save()
        .then((user) => {
            res.status(201).json({
                success: true,
                message: "Access Token Generated!",
                data: user,
            })
        })
        .catch((err) => {
            res.status(500).json({
                success: false,
                message: "Error Creating Acccess Token!",
                error: err
            })
        })
}


// the logic to register a new user
const registerController = async (req, res) => {
    const { name, email, password } = req.body

    if(!name || !email || !password){
        res.status(400).json({
            success: false,
            message: "All Fields are Required!"
        });
        return ;
    }

    // securing the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // generating an access token - valid for 1 day
    const accessTokenExp = Date.now()/1000 + 24*60*60;
    const accessToken = generateToken({
        email,
        name
    }, accessTokenExp)
    
    // generating a refresh token - valid for 5 days
    const refreshTokenExp = Date.now()/1000 + 5*24*60*60;
    const refreshToken = generateToken({
        email,
        name
    }, refreshTokenExp)

    const user = new userModel({
        name,
        email, 
        password: hashedPassword,
        tokens: {
            refreshToken: {
                token: refreshToken,
                expireAt: new Date(refreshTokenExp*1000)
            },
            accessToken: {
                token: accessToken,
                expireAt: new Date(accessTokenExp*1000)
            }
        }
    });

    user.save()
        .then((user) => {
            res.status(201).json({
                success: true,
                message: "New User Created Successfully!",
                data: user,
                tokens: {
                    accessToken: {
                        token: accessToken,
                        expireAt: new Date(accessTokenExp*1000)
                    },
                    refreshToken: {
                        token: refreshToken,
                        expireAt: new Date(refreshTokenExp*1000)
                    }
                }
            })
        })
        .catch((err) => {
            res.status(500).json({
                success: false,
                message: "There was some error!",
                error: err
            })
        })
}


// the logic to login a new user
const loginController = async (req, res) => {
    const { email, password } = req.body

    if(!email || !password){
        res.status(400).json({
            success: false,
            message: "All Fields are Required!"
        });
        return ;
    }

    try {
        const user = await userModel.findOne({email});

        if(!user){
            res.status(422).json({
                success: false,
                message: "Invalid Email!"
            })
            return;
        }

        const userPassword = user.password
        const passwordCheck = await bcrypt.compare(password, userPassword);

        if(!passwordCheck){
            res.status(422).json({
                success: false,
                message: "User Credentials don't match!"
            })
            return;
        }

        res.status(200).json({
            success: true,
            message: "Login Successful!",
            data: user
        });
    }
    catch(error){
        console.error("Error in operation:", error);
        res.status(500).json({
          success: false,
          message: "Internal Server Error",
        });
    }
}

module.exports = {
    registerController, 
    loginController,
    generateAccesstoken
}