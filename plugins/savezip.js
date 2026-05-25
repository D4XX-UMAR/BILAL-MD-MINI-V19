const { cmd } = require('../command');
const fetch = require('node-fetch');

cmd({
    pattern: "savezip",
    alias: ["webzip", "sitezip", "getzip", "savecode", "getcode"],
    react: "📦",
    desc: "Download website as ZIP",
    category: "tools",
    use: ".saveweb https://example.com",
    filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {

    try {

        if (!q) {
            return reply(
`❌ Please provide website URL!

Example:
.saveweb https://google.com`
            );
        }

        // URL check
        if (!q.startsWith("http://") && !q.startsWith("https://")) {
            return reply("❌ Invalid URL!");
        }

        await reply("📦 Copying website files...");

        // API URL
        const api = `https://api.lexcode.biz.id/api/tools/saveweb2zip?url=${encodeURIComponent(q)}`;

        const response = await fetch(api);
        const data = await response.json();

        if (!data.success || !data.result?.download) {
            return reply("❌ Failed to create website ZIP!");
        }

        const result = data.result;

        // SEND RESULT
        await conn.sendMessage(from, {
            document: { url: result.download },
            mimetype: 'application/zip',
            fileName: 'website.zip',
            caption:
`📦 *Website ZIP Created Successfully!*

🌐 Target:
${result.target}

📁 Files Copied:
${result.copiedFiles}

✅ Finished:
${result.finished}`
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply(`❌ Error: ${e.message}`);
    }

});
