const { cmd } = require('../command');
const fetch = require('node-fetch');
const yts = require('yt-search');

cmd({
    pattern: "play",
    alias: ["ytplay", "music"],
    react: "👑",
    desc: "Download YouTube audio",
    category: "download",
    use: ".play <song name>",
    filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {
    try {

        if (!q) {
            return reply("*AP NE KOI YOUTUBR SE AUDIO DOWNLOAD KARNI HAI 🤔*\n*TO AP ESE LIKHO 😊*\n\n*.PLAY ❮AUDIO NAME❯*\n*JESE KE.......*\n.PLAY ❮ISLAMIC NAAT❯*\n\n*APKO JO BHI SONG CHAHYE NAME LIKH DENA FIR WO AUDIO DOWNLOAD KAR KE YAHA PER BHEJ DYA JAYE GA 🤗*");
        }

        await reply("*APKA AUDIO DOWNLOAD HO RAHA HAI....*\n\n*THORA SA INTAZAR KARE 🤗*");

        let videoUrl = q;
        let searchData;

        // If not URL → search with yts
        if (!q.includes("youtube.com") && !q.includes("youtu.be")) {

            searchData = await yts(q);

            if (!searchData.videos.length) {
                return reply("*AUDIO NAHI MILA SORRY 😓*");
            }

            videoUrl = searchData.videos[0].url;
        }

        // API request
        const api = `https://api.ilhm.my.id/download/youtube?url=${encodeURIComponent(videoUrl)}&type=audio&resolusi=144`;

        const response = await fetch(api);
        const data = await response.json();

        if (!data.status || !data.result) {
            return reply("*KOI AUR AUDIO NAME LIKHO 😊*");
        }

        const result = data.result;

        const title = result.title || "Unknown";
        const thumbnail = result.thumbnail;
        const audioUrl = result.download;
        const duration = result.duration || "Unknown";

        // Send thumbnail + details
        await conn.sendMessage(from, {
            image: { url: thumbnail },
            caption:
`*👑 AUDIO NAME 👑*
*${title}*

*👑 TIME :❯ ${duration} SCNDS*
*👑 QUALITY :❯ ${result.quality}*

*👑 BY :❯ BILAL-MD 👑*`
        }, { quoted: mek });

        // Send audio
        await conn.sendMessage(from, {
            audio: { url: audioUrl },
            mimetype: 'audio/mpeg',
            ptt: false
        }, { quoted: mek });

        return reply("*ENJOY UOUR AUDIO 🙂*");

    } catch (e) {
        console.log(e);
        return reply(`❌ Error: ${e.message}`);
    }
});
