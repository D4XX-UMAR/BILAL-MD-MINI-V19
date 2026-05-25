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
            return reply("*APKE PASS KOI BARA SE LINK HAI 😳 AUR AP ISKO CHOTA KARNA CHAHTE HO 😂*\n*AP ESE LIKHO 😊*\n\n*.SHORTURL ❮APKA BARA LINKK❯*\n\n*JAB AP ESE LIKHO GE TO APKA BARA LINK CHOTE SE LINK ME CHANGE HO JAYE GA 😂🤗*");
        }

        // Basic URL check
        if (!q.startsWith("http://") && !q.startsWith("https://")) {
            return reply("*LINK SAI DO YEH LINK GHALAT HAI 🥲*");
        }

        await reply("*APKA LINK CHOTA HO RHA HAI.....😂*");

        const api = `https://api.ilhm.my.id/tools/shorturl?url=${encodeURIComponent(q)}&service=auto`;

        const response = await fetch(api);
        const data = await response.json();

        if (!data.status || !data.result) {
            return reply("*DUBARA KOSHISH KARE 😊*");
        }

        const shortUrl = data.result;

        await conn.sendMessage(from, {
            text:
`*👑 SUCCESSED 👑*

*APKA ASAL LINK*
*${q}*

*AB CHOTA SA LINK*
*${shortUrl}*

*👑 BY :❯ BILAL-MD 👑*`
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply(`❌ Error: ${e.message}`);
    }

});
