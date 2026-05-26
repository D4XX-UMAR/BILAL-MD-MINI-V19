const { cmd } = require('../command');
const FormData = require('form-data');
const fetch = require('node-fetch');

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

        console.log("\n========== IMGTOURL DEBUG ==========\n");

        console.log("✅ Command Started");

        console.log("FROM:", from);

        console.log("MESSAGE TYPE:", m.mtype);

        await reply(
`🔍 *IMGTOURL DEBUG STARTED*

📨 From: ${from}
📦 Type: ${m.mtype}`
        );

        // SAVE IMAGE
        if (
            m.mtype &&
            m.mtype.includes("image")
        ) {

            console.log("✅ Direct image detected");

            await reply(
                "✅ Direct image detected"
            );

            global.lastImages[from] = m;

        }

        let mediaMessage = null;

        // REPLY IMAGE
        if (m.quoted) {

            console.log("✅ Quoted message found");

            await reply(
                "✅ Quoted message found"
            );

            const mime =
                m.quoted.mtype ||
                m.quoted.mediaType ||
                "";

            console.log("QUOTED MIME:", mime);

            await reply(
                `📦 Quoted MIME: ${mime}`
            );

            if (mime.includes("image")) {

                console.log("✅ Quoted image detected");

                await reply(
                    "✅ Quoted image detected"
                );

                mediaMessage = m.quoted;

            }

        } else {

            console.log("❌ No quoted message");

            await reply(
                "❌ No quoted message"
            );

        }

        // DIRECT IMAGE
        if (!mediaMessage) {

            const mime =
                m.mtype ||
                m.mediaType ||
                "";

            console.log("DIRECT MIME:", mime);

            await reply(
                `📦 Direct MIME: ${mime}`
            );

            if (mime.includes("image")) {

                console.log("✅ Using direct image");

                await reply(
                    "✅ Using direct image"
                );

                mediaMessage = m;

            }

        }

        // LAST IMAGE
        if (
            !mediaMessage &&
            global.lastImages[from]
        ) {

            console.log("✅ Using saved previous image");

            await reply(
                "✅ Using saved previous image"
            );

            mediaMessage =
                global.lastImages[from];

        }

        // NO IMAGE
        if (!mediaMessage) {

            console.log("❌ No image found");

            return reply(
                "❌ Send or reply to an image!"
            );

        }

        await reply(
            "📤 Uploading image..."
        );

        console.log("✅ Upload message sent");

        let media;

        // DOWNLOAD
        try {

            console.log("⬇️ Downloading media...");

            await reply(
                "⬇️ Downloading media..."
            );

            if (
                typeof mediaMessage.download ===
                "function"
            ) {

                console.log("✅ Using media.download()");

                await reply(
                    "✅ Using media.download()"
                );

                media =
                    await mediaMessage.download();

            } else {

                console.log("✅ Using conn.downloadMediaMessage()");

                await reply(
                    "✅ Using conn.downloadMediaMessage()"
                );

                media =
                    await conn.downloadMediaMessage(
                        mediaMessage
                    );

            }

            console.log("✅ Media downloaded");

            await reply(
                "✅ Media downloaded"
            );

        } catch (downloadError) {

            console.log("❌ DOWNLOAD ERROR:");

            console.log(downloadError);

            return reply(
`❌ DOWNLOAD ERROR

${downloadError.message}`
            );

        }

        // BUFFER CHECK
        if (!media) {

            console.log("❌ Media buffer empty");

            return reply(
                "❌ Image download failed!"
            );

        }

        console.log("✅ Buffer Size:", media.length);

        await reply(
            `✅ Buffer Size: ${media.length}`
        );

        // FORM
        console.log("📝 Creating form data");

        await reply(
            "📝 Creating form data"
        );

        const form = new FormData();

        form.append(
            "reqtype",
            "fileupload"
        );

        form.append(
            "fileToUpload",
            media,
            {
                filename: "image.jpg",
                contentType: "image/jpeg"
            }
        );

        console.log("✅ Form created");

        await reply(
            "✅ Form created"
        );

        // UPLOAD
        let data;

        try {

            console.log("📡 Uploading to Catbox...");

            await reply(
                "📡 Uploading to Catbox..."
            );

            const res = await fetch(
                "https://catbox.moe/user/api.php",
                {
                    method: "POST",
                    body: form,
                    headers: form.getHeaders()
                }
            );

            console.log("✅ Response received");

            await reply(
                "✅ Response received"
            );

            data = await res.text();

            console.log("📨 Catbox Response:");

            console.log(data);

            await reply(
                `📨 Catbox Response:\n${data}`
            );

        } catch (uploadError) {

            console.log("❌ UPLOAD ERROR:");

            console.log(uploadError);

            return reply(
`❌ UPLOAD ERROR

${uploadError.message}`
            );

        }

        // FAILED
        if (!data.startsWith("https://")) {

            console.log("❌ Invalid URL response");

            return reply(
`❌ Upload failed!

${data}`
            );

        }

        console.log("✅ Valid URL generated");

        console.log("🔗 URL:", data);

        await reply(
            `✅ Valid URL Generated\n\n🔗 ${data}`
        );

        // SUCCESS
        try {

            console.log("📤 Sending final message...");

            await reply(
                "📤 Sending final message..."
            );

            await conn.sendMessage(
                from,
                {
                    text:
`🖼️ *Image Uploaded Successfully!*

🔗 URL:
${data}`
                },
                {
                    quoted: mek
                }
            );

            console.log("✅ Message sent successfully");

            await reply(
                "✅ Message sent successfully"
            );

        } catch (sendError) {

            console.log("❌ SEND MESSAGE ERROR:");

            console.log(sendError);

            return reply(
`❌ SEND ERROR

${sendError.message}`
            );

        }

        console.log("\n========== COMMAND SUCCESS ==========\n");

        await reply(
            "✅ COMMAND SUCCESS"
        );

    } catch (e) {

        console.log("\n❌ MAIN ERROR:\n");

        console.log(e);

        reply(
`❌ MAIN ERROR

${e.message}`
        );

    }

});
