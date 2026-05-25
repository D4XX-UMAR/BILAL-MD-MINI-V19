const { cmd } = require('../command');
const fetch = require('node-fetch');
const yts = require('yt-search');

cmd({
    pattern: "play",
    alias: ["ytplay", "music"],
    react: "🎶",
    desc: "Download YouTube audio",
    category: "download",
    use: ".play <song name>",
    filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {
    try {

        if (!q) {
            return reply("❌ Please provide song name or YouTube URL!");
        }

        await reply("🔍 Searching song...");

        let videoUrl = q;
        let searchData;

        // If not URL → search with yts
        if (!q.includes("youtube.com") && !q.includes("youtu.be")) {

            searchData = await yts(q);

            if (!searchData.videos.length) {
                return reply("❌ Song not found!");
            }

            videoUrl = searchData.videos[0].url;
        }

        // API request
        const api = `https://api.ilhm.my.id/download/youtube?url=${encodeURIComponent(videoUrl)}&type=audio&resolusi=144`;

        const response = await fetch(api);
        const data = await response.json();

        if (!data.status || !data.result) {
            return reply("❌ Failed to fetch audio!");
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
`🎶 *${title}*

⏱ Duration: ${duration}s
📥 Quality: ${result.quality}

⬇️ Downloading audio...`
        }, { quoted: mek });

        // Send audio
        await conn.sendMessage(from, {
            audio: { url: audioUrl },
            mimetype: 'audio/mpeg',
            ptt: false
        }, { quoted: mek });

        return reply("✅ Audio sent successfully!");

    } catch (e) {
        console.log(e);
        return reply(`❌ Error: ${e.message}`);
    }
});
