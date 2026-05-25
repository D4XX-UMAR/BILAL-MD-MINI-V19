const { cmd } = require('../command');
const fetch = require('node-fetch');

cmd({
    pattern: "short",
    alias: ["shorturl", "tiny"],
    react: "🔗",
    desc: "Shorten URL",
    category: "tools",
    use: ".short <url>",
    filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {

    try {

        if (!q) {
            return reply("❌ Please provide a URL!");
        }

        // Basic URL check
        if (!q.startsWith("http://") && !q.startsWith("https://")) {
            return reply("❌ Invalid URL!\nExample:\n.short https://google.com");
        }

        await reply("🔗 Shortening URL...");

        const api = `https://api.ilhm.my.id/tools/shorturl?url=${encodeURIComponent(q)}&service=auto`;

        const response = await fetch(api);
        const data = await response.json();

        if (!data.status || !data.result) {
            return reply("❌ Failed to shorten URL!");
        }

        const shortUrl = data.result;

        await conn.sendMessage(from, {
            text:
`🔗 *URL Shortened Successfully!*

🌐 Original:
${q}

✨ Short URL:
${shortUrl}`
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply(`❌ Error: ${e.message}`);
    }

});
