const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "fb",
    alias: ["fbdl", "facebook", "reel"],
    desc: "Download FB Video/Reel HD",
    category: "download",
    react: "👑",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("*AP NE KOI FACEBOOK KI VIDEO DOWNLOAD KARNI HAI 🤔*\n*TO AP PEHLE US FACEBOOK VIDEO KA LINK COPY KAR LE LAZMI 🙄*\n*PHIR ESE LIKHO 😊\n\n*.FB ❮FACEBOOK VIDEO LINK❯*\n\n*JAB AP ESE LIKHO GE TO APKI FACEBOOK VIDEO DOWNLOAD KAR KE YAHA BHEJ DE JAYE GE 🤗*");

        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        // PrinceTech API URL
        const apiUrl = `https://api.nexray.eu.cc/downloader/aio?url=${encodeURIComponent(q)}`;
        
        const response = await axios.get(apiUrl);
        const data = response.data;

        if (!data.success || !data.result) {
            return reply("*APKI FACEBOOK VIDEO NAHI MIL RAHI SORRY 😓*");
        }

        const { title, hd_video, sd_video, duration } = data.result;

        // Agar HD video link hai toh wo uthayega, warna SD
        const videoLink = hd_video || sd_video;

        const msg = `*👑 FB VIDEO 👑*\n\n` +
                    `*👑 NAME :❯* ${title}\n` +
                    `*👑 TIME :❯ ${duration}*\n` +
                    `*👑 QUALITY :❯ ${hd_video ? 'High Definition (HD)' : 'Standard (SD)'}*\n\n` +
                    `*👑 BY :❯ BILAL-MD 👑*`;

        // Video Send Karein
        await conn.sendMessage(from, {
            video: { url: videoLink },
            caption: msg
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: "👑", key: mek.key } });

    } catch (e) {
        console.error(e);
        reply("❌ FB Error: Connection timeout ya invalid API response.");
    }
});
