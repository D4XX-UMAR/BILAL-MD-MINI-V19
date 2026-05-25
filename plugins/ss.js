const { cmd } = require('../command');
const fetch = require('node-fetch');

cmd({
    pattern: "ssweb",
    alias: ["ss", "webss"],
    react: "👑",
    desc: "Take website screenshot",
    category: "tools",
    use: ".ssweb https://google.com",
    filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {

    try {

        if (!q) {
            return reply(
`*AP NE KISI WEBSITE KA SCREENSHOT LENA HAI 🤔*\n*TO AP US WEBSITE KA LINK COPY KAR LO 🤗*\n\n*AUR ESE LIKHO 😊*\n\n*.SS ❮WEBSITE LINK❯*\n\n*JAB AP ESE LIKHO GE TO APKO US WEBSITE KA SCREENSHOT LE KR YAHA BHEJ DIA JAYE GA 🤗*`
            );
        }

        // URL check
        if (!q.startsWith("http://") && !q.startsWith("https://")) {
            return reply("*LINK GHALAT HAI 🙄*");
        }

        await reply("*THORA SA INTAZAR KARE.....*\n*SCREENSHOT SEND HO RAHA HAI 😊*");

        // API URL
        const api = `https://api.deline.web.id/tools/screenshot?url=${encodeURIComponent(q)}`;

        // Send screenshot
        await conn.sendMessage(from, {
            image: { url: api },
            caption:
`*👑 WEBSITE LINK 👑*
*${q}*

*👑 BY :❯ BILAL-MD 👑*`
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply(`❌ Error: ${e.message}`);
    }

});
