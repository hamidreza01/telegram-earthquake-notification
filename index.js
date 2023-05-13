const { Telegraf } = require("telegraf");
const bot = new Telegraf(process.env.BOT_TOKEN);
const app = require("express")();
const axios = require('axios').default;
function extractImportantData(data) {
    const feature = data.features[data.features.length - 1];
    const properties = feature.properties;
    const magnitude = properties.mag;
    const place = properties.place;
    const time = new Date(properties.time);
    const url = properties.url;
    const detail = properties.detail;
    const status = properties.status;
    const tsunami = properties.tsunami;
    const title = properties.title;
    return {
        magnitude,
        place,
        time,
        url,
        detail,
        status,
        tsunami,
        title
    };
}

app.get("/update", async (req, res) => {
    const response = await axios.get('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson');
    const data = extractImportantData(response.data);
    const now = new Date();
   if (now - data.time < 1000 * 60 * 10) {
        if (data.magnitude > Number(process.env.LIMIT)) {
            bot.telegram.sendMessage(
                process.env.USERNAME,
                "🌍 New Earthquake Alert! 🌍\n\n"
                + "Magnitude: " + data.magnitude + " Richter\n"
                + "📍 Location: " + data.place + "\n"
                + "🕒 Time: " + data.time + "\n"
                + "🔍 Details: <a href=\"" + data.url + "\">link</a>\n"
                + "📊 Status: " + data.status + "\n"
                + "🌊 Tsunami: " + (data.tsunami === 0 ? 'No' : 'Yes') + "\n"
                + "🔖 Title: <code>" + data.title + "</code>\n\n"
                + "Stay Safe and Be Prepared! 🌏\n"
                + "🚨 " + process.env.USERNAME, {parse_mode: "HTML"})
        }
   }
    return res.send("ok")
})

app.listen(3000)
