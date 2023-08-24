// the cron job wil be taking place in this file
const cron = require("node-cron")
const axios = require("axios")
const nodemailer = require("nodemailer")
const websiteModel = require("../models/websiteModel")


// transport - necessary for nodemailer
const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
})


// function to check if the website is active or not during routine checks
const isWebsiteActive = async (url) => {
    if(!url){
        return false;
    }

    const response = await axios.get(url).catch((err) => void err)
    // any status response except 200 will be considered as dowwntime
    if(!response || response.status !== 200){
        return false;
    }

    return true;
}


// the logic of cron job
const scheduleWebsiteStatusCheck = () => {
    // will be done once in every hour
    cron.schedule("0 */1 * * *", async () => {
        try{
            const allWebsites = await websiteModel.find({}).populate({
                path: "userId",
                select: ["name", "email"],
            });

            for(const website of allWebsites){
                const url = website.url;
                const isActive = await isWebsiteActive(url);
                
                // Update website's isActive status in the database
                await websiteModel.updateOne({ _id: website.id }, { isActive });
                // the current status as well as the previous state is checked
                // if the website was down during the previous check as well then mail will not be sent for that website
                // mails will be sent if the site goes down during the current check but was active during the previous check
                if(!isActive && website.isActive) {
                    // Send email notification
                    transport.sendMail({
                        from: process.env.EMAIL,
                        to: website.userId.email,
                        subject: "Your website is down!",
                        html: `The website - <b>${website.url}</b> is down. Detected while we were doing our routine check on ${new Date().toLocaleString("en-in")}`,
                    });
                }
            }
        } 
        catch(error){
            console.error("Error:", error);
        }
    });
};


module.exports = scheduleWebsiteStatusCheck