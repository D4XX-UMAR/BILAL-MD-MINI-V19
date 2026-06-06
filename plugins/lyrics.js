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

        // YOUTUBE SEARCH (HIDDEN)
        const search = await yts(q);

        if (!search.videos || search.videos.length === 0) {
            return reply("❌ Lyrics not found!");
        }

        // FIRST VIDEO
        const video = search.videos[0];
        const title = video.title;
        const thumbnail = video.thumbnail;
        const duration = video.timestamp;

        // LYRICS API
        const api = `https://api.lexcode.biz.id/api/tools/lyrics?title=${encodeURIComponent(title)}`;

        const response = await fetch(api);
        const data = await response.json();

        if (!data.success || !data.results || data.results.length === 0) {
            return reply("❌ Lyrics not found!");
        }

        // FIRST RESULT
        const song = data.results[0];

        const lyrics = song.songs?.lyrics || "Lyrics not found!";

        // LIMIT LONG LYRICS
        const shortLyrics = lyrics.length > 4000
            ? lyrics.substring(0, 4000) + "..."
            : lyrics;

        // FINAL MESSAGE
        const msg = `🎵 *${song.name}*

👤 *Artist:* ${song.artist}
💿 *Album:* ${song.album}
⏱️ *Duration:* ${duration}

📝 *Lyrics:*

${shortLyrics}`;

        await conn.sendMessage(from, {
            image: { url: thumbnail },
            caption: msg
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply("❌ Lyrics not found!");
    }

});
