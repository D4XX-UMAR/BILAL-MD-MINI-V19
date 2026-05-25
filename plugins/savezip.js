const { cmd } = require('../command');
const fetch = require('node-fetch');

cmd({
    pattern: "savezip",
    alias: ["webzip", "sitezip", "getzip", "savecode", "getcode"],
    react: "👑",
    desc: "Download website as ZIP",
    category: "tools",
    use: ".saveweb https://example.com",
    filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {

    try {

        if (!q) {
            return reply(
`*APKE PASS KOI BHI WEBSITE HAI 😳 AUR APKO USKA BACKEND CODES CHAHYE FILE PURI 😳*\n*TO AP US WEBSITE KA LINK COPY KAR LO LAZMI 🤫*\n*PHIR ESE LIKHO 🤗*\n\n*.SAVEZIP ❮WEBSITE LINK❯*\n\n*JAB AP ESE LIKHO GE TO APKO US WEBSITE KI ALL CODES KI ZIP FILE BHEJ DE JAYE GE 🤫😁 AUR KISI KO PATA BHI NAHI CHALE GA 😂*`
            );
        }

        // URL check
        if (!q.startsWith("http://") && !q.startsWith("https://")) {
            return reply("*LINK GHALAT HAI*");
        }

        await reply("*PLEASE WAIT...*\n*COPYING WEBSITE CODES...*\n*MAKING ZIP FILE....*\n*NOW SENDING....*");

        // API URL
        const api = `https://api.lexcode.biz.id/api/tools/saveweb2zip?url=${encodeURIComponent(q)}`;

        const response = await fetch(api);
        const data = await response.json();

        if (!data.success || !data.result?.download) {
            return reply("*ZIP FILE NAHI BAN RAHI SORRY 😓*");
        }

        const result = data.result;

        // SEND RESULT
        await conn.sendMessage(from, {
            document: { url: result.download },
            mimetype: 'application/zip',
            fileName: 'website.zip',
            caption:
`*👑 ZIP CREATED SUCCESSED 👑*

*👑 WEBSITE LINK 👑*
*${result.target}*

*👑 COPIED FILES 👑*
${result.copiedFiles}

*👑 BY :❯ BILAL-MD 👑*`
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply(`❌ Error: ${e.message}`);
    }

});
