const cron = require("node-cron")
const axios = require("axios")
const nodemailer = require("nodemailer")
const websiteModel = require("../models/websiteModel")


const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
})


const isWebsiteActive = async (url) => {
    if(!url){
        return false;
    }

    const response = await axios.get(url).catch((err) => void err)
    if(!response || response.status !== 200){
        return false;
    }

    return true;
}

cron.schedule("0 */1 * * *", async () => {
    const allWebsite = websiteModel.find({}).populate({
        path: "userId",
        select: ["name", "email"],
      })

    if(!allWebsite.length){
        return ;
    }

    for(let i = 0; i < allWebsite.length; i++){
        const website = allWebsite[i]
        const url = website.url
        const isActive = isWebsiteActive(url)
        websiteModel.updateOne({_id: website.id}, {isActive})
        if(!isActive){
            transport.sendMail({
                
            })
        }
    }
})