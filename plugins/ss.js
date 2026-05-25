const { cmd } = require('../command');
const fetch = require('node-fetch');

cmd({
    pattern: "ssweb",
    alias: ["ss", "webss"],
    react: "📸",
    desc: "Take website screenshot",
    category: "tools",
    use: ".ssweb https://google.com",
    filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {

    try {

        if (!q) {
            return reply(
`❌ Please provide website URL!

Example:
.ssweb https://google.com`
            );
        }

        // URL check
        if (!q.startsWith("http://") && !q.startsWith("https://")) {
            return reply("❌ Invalid URL!");
        }

        await reply("📸 Taking website screenshot...");

        // API URL
        const api = `https://api.deline.web.id/tools/screenshot?url=${encodeURIComponent(q)}`;

        // Send screenshot
        await conn.sendMessage(from, {
            image: { url: api },
            caption:
`📸 *Website Screenshot*

🌐 URL:
${q}`
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply(`❌ Error: ${e.message}`);
    }

});
