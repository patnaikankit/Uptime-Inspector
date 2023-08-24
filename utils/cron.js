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


const scheduleWebsiteStatusCheck = () => {
    cron.schedule("*/1 * * * *", async () => {
        try {
            console.log("Cron start");
            const allWebsites = await websiteModel.find({}).populate({
                path: "userId",
                select: ["name", "email"],
            });

            for (const website of allWebsites) {
                const url = website.url;
                const isActive = await isWebsiteActive(url);
                
                // Update website's isActive status in the database
                await websiteModel.updateOne({ _id: website.id }, { isActive });

                console.log("checking website", website.url);

                if (!isActive && website.isActive) {
                    // Send email notification
                    transport.sendMail({
                        from: process.env.EMAIL,
                        to: website.userId.email,
                        subject: "Your website is down!",
                        html: `The website - <b>${website.url}</b> is down. Detected while we were doing our routine check on ${new Date().toLocaleString("en-in")}`,
                    });
                }
            }
        } catch (error) {
            console.error("Error:", error);
        }
    });
};



module.exports = scheduleWebsiteStatusCheck