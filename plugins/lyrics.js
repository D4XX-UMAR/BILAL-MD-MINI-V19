const { cmd } = require('../command');
const fetch = require('node-fetch');
const yts = require('yt-search');

cmd({
    pattern: "lyrics",
    alias: ["lyric", "songlyrics"],
    react: "🎵",
    desc: "Get song lyrics",
    category: "search",
    use: ".lyrics song name",
    filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {

    try {

        if (!q) {
            return reply("❌ Please provide song name!");
        }

        // HIDDEN YOUTUBE SEARCH
        const search = await yts(q);

        // FIRST VIDEO TITLE
        const title = search.videos[0]?.title;

        if (!title) {
            return reply("❌ Lyrics not found!");
        }

        // LYRICS API
        const api = `https://api.lexcode.biz.id/api/tools/lyrics?query=${encodeURIComponent(title)}`;

        const response = await fetch(api);
        const data = await response.json();

        if (!data.success || !data.results.length) {
            return reply("❌ Lyrics not found!");
        }

        const song = data.results[0];

        const thumbnail = search.videos[0].thumbnail;
        const duration = search.videos[0].timestamp;

        const lyrics = song.songs?.lyrics || "Lyrics not found!";

        // LIMIT LYRICS
        const shortLyrics = lyrics.length > 4000
            ? lyrics.substring(0, 4000) + "..."
            : lyrics;

        // FINAL RESULT ONLY
        await conn.sendMessage(from, {
            image: { url: thumbnail },
            caption:
`🎵 *${title}*

⏱ Duration: ${duration}

📝 Lyrics:
${shortLyrics}`
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply("❌ Lyrics not found!");
    }

});
