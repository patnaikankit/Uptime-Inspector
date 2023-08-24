// this will be protected route so everything associated with it needs to be authenicated

const axios = require("axios")
const websiteModel = require("../models/websiteModel");
const userModel = require("../models/userModel");

// to check if the url format passed is correct or not
function validateUrl(value) {
    return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(
      value
    );
  }


// logic to add a website for checking
// while adding websites, only functional and real websites can be added
// websites which do not exist cannot be added 
const addWebsiteController = async (req, res) => {
    const { url } = req.body

    // if provided url does not exist
    if(!url){
        res.stats(400).json({
            success: false,
            message: "No Url's found!"
        })
        return ;
    }

    // checking the url format
    const validUrl = validateUrl(url)
    if(!validUrl){
        res.status(422).json({
            success: false,
            message: "Wrong Url Format!"
        })
        return ;
    }

    const user = req.user

    // here we are checking whether the website is a real website or not
    // a website which is real but is not functional at the time of adding will not be accepted
    const response = await axios.get(url).catch((err) => void err)
    if(!response || response.status !== 200){
        res.status(422).json({
            success: false,
            message: "Provide url " + url + " is not Active!"
        })
        return ;
    }

    // once the website passes all checks it will be initially given a isActive flag as true and all further downtime and backup will be updated and stored during the routine checks
    const website = new websiteModel({
        url,
        userId: user._id,
        isActive: true
    })

    website.save()
        .then((url) => {
            res.status(201).json({
                success: true,
                message: "New Website Added!",
                data: url
            })
        })
        .catch((err) => {
            res.status(500).json({
                success: false,
                message: "Error while adding new website!",
                error: err
            })
        })
}


// the logic to delete a website
const deleteWebsiteController = async (req, res) => {
    const id = req.params.webId

    if(!id){
        res.stats(400).json({
            success: false,
            message: "No Url's found!"
        })
        return ;
    }

    websiteModel.deleteOne({_id: id})
        .then(() => {
            res.status(200).json({
                success: true,
                message: "Website Deleted Successfully!",
            })
        })
        .catch((err) => {
            res.status(500).json({
                success: false,
                message: "Error while deleting website!",
                error: err
            })
        })
}


// the logic to retrive all you stored websites
const getAllWebsiteController = async (req, res) => {
    const respone = await websiteModel.find({userId: req.user._id}).populate({
        path: "userId",
        select: ["name", "email"],
      });

    const size = respone.length
    res.status(200).json({
        numWebsites: size,
        success: true,
        data: respone
    })
}


module.exports = {
    addWebsiteController,
    deleteWebsiteController,
    getAllWebsiteController
}