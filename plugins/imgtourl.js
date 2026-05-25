const { cmd } = require('../command');
const FormData = require('form-data');
const fetch = require('node-fetch');

cmd({
    pattern: "imgtourl",
    alias: ["tourl", "imgurl"],
    react: "🖼️",
    desc: "Convert image to URL",
    category: "tools",
    use: ".imgtourl",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {

    try {

        let mediaMessage = null;

        // Reply image detect
        if (m.quoted) {

            const mime =
                m.quoted.mtype ||
                m.quoted.mediaType ||
                "";

            if (mime.includes("image")) {
                mediaMessage = m.quoted;
            }
        }

        // Direct image detect
        if (!mediaMessage) {

            const mime =
                m.mtype ||
                m.mediaType ||
                "";

            if (mime.includes("image")) {
                mediaMessage = m;
            }
        }

        // Previous image detect
        if (!mediaMessage) {

            const messages = await conn.loadMessages(from, 10);

            for (const msg of messages.reverse()) {

                if (msg.message?.imageMessage) {
                    mediaMessage = msg;
                    break;
                }
            }
        }

        // No image found
        if (!mediaMessage) {
            return reply("❌ Send or reply to an image!");
        }

        await reply("📤 Uploading image...");

        // Download image
        let media;

        if (typeof mediaMessage.download === "function") {
            media = await mediaMessage.download();
        } else {
            media = await conn.downloadMediaMessage(mediaMessage);
        }

        if (!media) {
            return reply("❌ Image download failed!");
        }

        // FormData
        const form = new FormData();

        form.append("reqtype", "fileupload");

        form.append("fileToUpload", media, {
            filename: "image.jpg",
            contentType: "image/jpeg"
        });

        // Upload to Catbox
        const res = await fetch(
            "https://catbox.moe/user/api.php",
            {
                method: "POST",
                body: form,
                headers: form.getHeaders()
            }
        );

        const data = await res.text();

        // Upload failed
        if (!data.startsWith("https://")) {

            console.log(data);

            return reply("❌ Upload failed!");
        }

        // Success
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
