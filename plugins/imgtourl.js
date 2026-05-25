const { cmd } = require('../command');
const FormData = require('form-data');
const fetch = require('node-fetch');

// Store last images
global.lastImages = global.lastImages || {};

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

        // Save latest image automatically
        if (m.mtype && m.mtype.includes("image")) {
            global.lastImages[from] = m;
        }

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
        if (!mediaMessage && global.lastImages[from]) {
            mediaMessage = global.lastImages[from];
        }

        // No image found
        if (!mediaMessage) {
            return reply("❌ Send or reply to an image!");
        }

        await reply("📤 Uploading image...");

        let media;

        // Download image
        if (typeof mediaMessage.download === "function") {
            media = await mediaMessage.download();
        } else {
            media = await conn.downloadMediaMessage(mediaMessage);
        }

        // Download failed
        if (!media) {
            return reply("❌ Image download failed!");
        }

        // Create form
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

        // Send success
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
