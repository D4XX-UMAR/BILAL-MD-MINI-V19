const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "fb",
    alias: ["fbdl", "facebook", "reel"],
    react: "👑",
    desc: "Facebook video downloader",
    category: "download",
    use: ".fb <facebook link>",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {

    try {

        if (!q) {
            return reply("*AP NE KOI FACEBOOK KI VIDEO DOWNLOAD KARNI HAI 🤔*\n*TO AP PEHLE US FACEBOOK VIDEO KA LINK COPY KAR LE LAZMI 🙄*\n*PHIR ESE LIKHO 😊\n\n*.FB ❮FACEBOOK VIDEO LINK❯*\n\n*JAB AP ESE LIKHO GE TO APKI FACEBOOK VIDEO DOWNLOAD KAR KE YAHA BHEJ DE JAYE GE 🤗*");
        }

        // REACT
        await conn.sendMessage(from, {
            react: { text: "😊", key: mek.key }
        });

        // API REQUEST
        const api = `https://api.nexray.eu.cc/downloader/aio?url=${encodeURIComponent(q)}`;

        const { data } = await axios.get(api);

        // CHECK
        if (!data.status || !data.result) {
            return reply("*APKI FACEBOOK VIDEO NAHI MILI 😓*");
        }

        // GET HD VIDEO
        const media =
            data.result.medias.find(v => v.quality === "HD") ||
            data.result.medias.find(v => v.type === "video");

        if (!media?.url) {
            return reply("*DUBARA KOSHISH KARE 😊*");
        }

        // INFO
        const title = data.result.title || "Facebook Video";
        const thumbnail = data.result.thumbnail || "";
        const duration = data.result.duration || "Unknown";

        // CAPTION
        const caption = `📥 *FACEBOOK DOWNLOADER*

🎬 Title: ${title}
⏱ Duration: ${duration}
📺 Quality: ${media.quality || "HD"}

👑 Powered By BILAL-MD`;

        // SEND VIDEO
        await conn.sendMessage(from, {
            video: { url: media.url },
            mimetype: "video/mp4",
            caption: caption,
            jpegThumbnail: thumbnail
        }, { quoted: mek });

        // DONE REACT
        await conn.sendMessage(from, {
            react: { text: "✅", key: mek.key }
        });

    } catch (e) {
        console.log(e);
        reply("❌ FB Download Failed!");
    }

});

