import cron from "cron";
import https from "https";

const job = new cron.CronJob("*/14 * * * *", function()  {
    https
        .get(process.env.API_URL, (res) => {
            if (res.statusCode === 200) 
                console.log("Cron job executed successfully");
             else 
                console.error(`Cron job failed with status code: ${res.statusCode}`);
            
        })
        .on("error",(e)=> console.error("error while sending request", e));
})
export default job;

//we want to run this job every 14 minutes