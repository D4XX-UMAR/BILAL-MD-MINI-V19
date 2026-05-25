const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "hd",
    alias: ["enhance", "remini"],
    react: "✨",
    desc: "Enhance image quality",
    category: "tools",
    use: ".hd reply image OR .hd image_url",
    filename: __filename
}, async (conn, m, mek, { from, quoted, q, reply }) => {

    try {

        let imageUrl;

        // Allowed image extensions
        const validExtensions = [
            ".jpg",
            ".jpeg",
            ".png",
            ".webp",
            ".gif",
            ".bmp"
        ];

        // URL MODE
        if (q && q.startsWith("http")) {

            const lowerUrl = q.toLowerCase();

            // Check image extension
            const isValid = validExtensions.some(ext =>
                lowerUrl.includes(ext)
            );

            if (!isValid) {
                return reply(
`❌ Invalid image URL!

✅ Supported formats:
jpg
jpeg
png
webp
gif
bmp`
                );
            }

            imageUrl = q;

        } else {

            // REPLY IMAGE MODE
            const msg = quoted ? quoted : m;

            const mime = (msg.msg || msg).mimetype || '';

            if (!mime.startsWith('image')) {
                return reply(
`❌ Reply to an image or provide image URL!

Example:
.hd https://example.com/image.jpg`
                );
            }

            await reply("📥 Downloading image...");

            const media = await conn.downloadMediaMessage(msg);

            // Upload image
            imageUrl = await conn.uploadFile(media);
        }

        await reply("✨ Enhancing image quality...");

        // API URL
        const api = `https://api.ilhm.my.id/tools/hd?url=${encodeURIComponent(imageUrl)}`;

        // Send enhanced image
        await conn.sendMessage(from, {
            image: { url: api },
            caption:
`✨ *Image Enhanced Successfully!*

🖼️ Powered By ILHM API`
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply(`❌ Error: ${e.message}`);
    }

});
