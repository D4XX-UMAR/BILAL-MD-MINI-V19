const { cmd } = require('../command');
const fetch = require('node-fetch');

cmd({
    pattern: "bing",
    alias: ["img", "image"],
    react: "🖼️",
    desc: "Search Bing Images",
    category: "search",
    use: ".bing cat",
    filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {

    try {

        if (!q) {
            return reply("❌ Please provide image name!");
        }

        await reply("🔍 Searching images...");

        const api = `https://api.ilhm.my.id/search/bingimage?q=${encodeURIComponent(q)}&limit=5`;

        const response = await fetch(api);
        const data = await response.json();

        if (!data.status || !data.result.length) {
            return reply("❌ No images found!");
        }

        for (let img of data.result) {

            const imageUrl = img.preview_url || img.original_url;

            await conn.sendMessage(from, {
                image: { url: imageUrl },
                caption: `🖼️ *Bing Image Result*\n\n🔎 Query: ${q}`
            }, { quoted: mek });

        }

    } catch (e) {
        console.log(e);
        reply(`❌ Error: ${e.message}`);
    }

});
