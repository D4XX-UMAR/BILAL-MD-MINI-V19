const { cmd } = require('../command');
const FormData = require('form-data');
const fetch = require('node-fetch');

cmd({
    pattern: "imgurl",
    alias: ["tolink", "imgtourl", "imgurl", "img2url", "tourl"],
    react: "🖼️",
    desc: "Convert image to URL",
    category: "tools",
    use: ".imgurl",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {

    try {

        let mediaMessage;

        // REPLY IMAGE
        if (m.quoted) {

            const mime =
                m.quoted.mtype ||
                m.quoted.mediaType ||
                "";

            if (mime.includes("image")) {
                mediaMessage = m.quoted;
            }
        }

        // DIRECT IMAGE WITH COMMAND
        if (!mediaMessage) {

            const mime =
                m.mtype ||
                m.mediaType ||
                "";

            if (mime.includes("image")) {
                mediaMessage = m;
            }
        }

        // NO IMAGE
        if (!mediaMessage) {
            return reply("❌ Send or reply to an image!");
        }

        // START MESSAGE
        await reply("📤 Uploading image...");

        // DOWNLOAD IMAGE
        const media = await mediaMessage.download();

        if (!media) {
            return reply("❌ Image download failed!");
        }

        // FORM DATA
        const form = new FormData();

        form.append("reqtype", "fileupload");

        form.append("fileToUpload", media, {
            filename: "image.jpg",
            contentType: "image/jpeg"
        });

        // UPLOAD TO CATBOX
        const response = await fetch(
            "https://catbox.moe/user/api.php",
            {
                method: "POST",
                body: form
            }
        );

        const data = await response.text();

        // CHECK RESPONSE
        if (!data || !data.startsWith("https")) {
            return reply("❌ Upload failed!");
        }

        // SEND URL
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
