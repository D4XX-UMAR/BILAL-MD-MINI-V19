const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "tiktok",
    alias: ["tt", "ttdl"],
    desc: "Download TikTok via Vercel API",
    category: "download",
    react: "📱",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("❌ Yar, TikTok link to paste karo!");

        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        const encodedUrl = encodeURIComponent(q);
        const apiUrl = `https://whiteshadow-api.vercel.app/download/tiktok?url=${encodedUrl}`;

        const response = await axios.get(apiUrl);
        const res = response.data;

        // Check if API response is successful
        if (!res.status || !res.result) {
            return reply("❌ API se video nahi mil saki. Shayad link galat hai ya API down hai.");
        }

        const data = res.result.data || res.result;

        // Stylish Caption with only available info
        let caption = `┏━━━━━━━⬣  *TIKTOK DL* ⬣━━━━━━━┓
┃
┃ 📝 *Title:* ${data.title || 'TikTok Video'}
┃ 👤 *Author:* ${data.author?.nickname || 'User'}
┃ ⏱️ *Duration:* ${data.duration || '0'}s
┃
┣━━━━━━━⬣ *STATISTICS* ⬣━━━━━━━┓
┃
┃ ❤️ *Likes:* ${data.digg_count || 0}
┃ 💬 *Comments:* ${data.comment_count || 0}
┃ 👀 *Views:* ${data.play_count || 0}
┃
┗━━━━━━━━━━━━━━━━━━━━━━┛

> *BILAL-MD WHATSAPP BOT* ⚡`;

        // Direct Video Sending (Priority: HD -> Normal -> Watermark)
        const videoUrl = data.hdplay || data.play || data.wmplay || data.url;

        if (!videoUrl) return reply("❌ Video URL nahi mil saka.");

        await conn.sendMessage(from, {
            video: { url: videoUrl },
            caption: caption
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

    } catch (e) {
        console.error(e);
        reply("❌ TikTok Error: Vercel API connect nahi ho rahi.");
    }
});
