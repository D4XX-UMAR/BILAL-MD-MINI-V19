const { cmd } = require('../command');
const axios = require('axios');
const yts = require('yt-search');

cmd({
    pattern: "video",
    alias: ["ytv", "v", "ytv", "mp4"],
    desc: "Search and Direct Video Downloader",
    category: "download",
    react: "👑",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("*AP NE KOI YOUTUBE SE VIDEO DOWNLOAD KARNI HAI 🤔*\n*TO AP ESE LIKHO 😊*\n\n*.VIDEO ❮VIDEO NAME❯*\n*JESE.....*\n.VIDEO AJA VE MAHIYA SONG*\n\n*JAB AP ESE LIKHO GE TO APKI VIDEO YOUTUBE SE DOWNLOAD KAR KE YAHA BHEJ DE JAYE GE 🤗*");

        await conn.sendMessage(from, { react: { text: "🔍", key: mek.key } });

        let videoUrl = q;

        // Agar user ne link nahi diya toh search karega
        if (!q.includes("youtube.com") && !q.includes("youtu.be")) {
            const search = await yts(q);
            const data = search.videos[0];
            if (!data) return reply("*APKI YOUTUBE VIDEO NAHI MILI 😓*");
            videoUrl = data.url;
        }

        // PrinceTech API se download link lena
        const apiUrl = `https://api.princetechn.com/api/download/dlmp4?apikey=prince&url=${encodeURIComponent(videoUrl)}`;
        const response = await axios.get(apiUrl);
        const resData = response.data;

        if (!resData.success || !resData.result) {
            return reply("*DUBARA KOSHISH KARE 🤗*");
        }

        // Direct Video Message
        await conn.sendMessage(from, {
            video: { url: resData.result.download_url },
            caption: `*${resData.result.title}*\n\n*👑 BY :❯ BILAL-MD 👑*`
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: "👑", key: mek.key } });

    } catch (e) {
        console.error(e);
        reply("❌ Error: API ne response nahi diya.");
    }
});
