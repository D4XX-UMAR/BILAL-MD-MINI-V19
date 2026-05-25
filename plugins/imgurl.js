const { cmd } = require('../command');
const FormData = require('form-data');
const fetch = require('node-fetch');

cmd({
    pattern: "imgurl",
    alias: ["tourl", "imgtourl"],
    react: "🖼️",
    desc: "Convert image to URL",
    category: "tools",
    use: ".imgurl reply image",
    filename: __filename
}, async (conn, m, mek, { from, quoted, reply }) => {

    try {

        const msg = quoted ? quoted : m;

        const mime = (msg.msg || msg).mimetype || '';

        if (!mime.startsWith('image')) {
            return reply("❌ Reply to an image!");
        }

        await reply("📤 Uploading image...");

        // Download image
        const media = await conn.downloadMediaMessage(msg);

        // FormData
        const form = new FormData();

        form.append('reqtype', 'fileupload');
        form.append('fileToUpload', media, 'image.jpg');

        // Upload to Catbox
        const response = await fetch('https://catbox.moe/user/api.php', {
            method: 'POST',
            body: form
        });

        const data = await response.text();

        if (!data.startsWith('https')) {
            return reply("❌ Upload failed!");
        }

        // Send URL
        await conn.sendMessage(from, {
            text:
`🖼️ *Image Uploaded Successfully!*

🔗 URL:
${data}`
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply(`❌ Error: ${e.message}`);
    }

});
