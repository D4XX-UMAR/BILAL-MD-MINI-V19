const { cmd } = require('../command');
const fetch = require('node-fetch');

cmd({
    pattern: "bing",
    alias: ["img", "image"],
    react: "👑",
    desc: "Search Bing Images",
    category: "search",
    use: ".bing cat",
    filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {

    try {

        if (!q) {
            return reply("*APKO KOI PHOTOS CHAHYE 🤗*\n*TO AP ESE LIKHO 😊*\n\n*.BING ❮PHOTO NAME❯*\n\n*JAB AP ESE LIKHO GE TO APKE PHOTOS YAHA BHEJ DIE JAYE GE 🤗*");
        }

        await reply("*APKE PHOTOS DOWNLOAD HO RAHE HAI....*");

        const api = `https://api.ilhm.my.id/search/bingimage?q=${encodeURIComponent(q)}&limit=5`;

        const response = await fetch(api);
        const data = await response.json();

        if (!data.status || !data.result.length) {
            return reply("*APKE PHOTOS NAHI MILE SORRY 😓*");
        }

        for (let img of data.result) {

            const imageUrl = img.preview_url || img.original_url;

            await conn.sendMessage(from, {
                image: { url: imageUrl },
                caption: `*👑 PHOTOS NAME 👑*\n ${q}\n\n*👑 BY :❯ BILAL-MD 👑*`
            }, { quoted: mek });

        }

    } catch (e) {
        console.log(e);
        reply(`❌ Error: ${e.message}`);
    }

});
