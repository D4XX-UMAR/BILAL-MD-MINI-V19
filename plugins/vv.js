const { cmd } = require('../command');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

cmd({
pattern: "vv",
alias: ["viewonce", "reveal"],
desc: "Reveal view-once image or video",
category: "tools",
react: "👑",
filename: __filename
},
async (conn, mek, m, { from, sender, reply }) => {
try {

    const rawQuoted = mek.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    if (!rawQuoted && !m.quoted) {
        return reply("*PEHLE VIEW ONCE MSG QUOTE KARO — PHIR .VV LIKHO* 😊");
    }

    let media = null;
    let mediaType = null;

    const findMedia = (msgObj) => {
        if (!msgObj) return;
        if (msgObj.imageMessage) { media = msgObj.imageMessage; mediaType = 'image'; }
        else if (msgObj.videoMessage) { media = msgObj.videoMessage; mediaType = 'video'; }
        else if (msgObj.audioMessage) { media = msgObj.audioMessage; mediaType = 'audio'; }
    };

    if (rawQuoted) {
        // Latest Baileys — sab view once formats
        findMedia(rawQuoted?.viewOnceMessageV2Extension?.message);
        if (!media) findMedia(rawQuoted?.viewOnceMessageV2?.message);
        if (!media) findMedia(rawQuoted?.viewOnceMessage?.message);
        if (!media) findMedia(rawQuoted?.ephemeralMessage?.message?.viewOnceMessageV2?.message);
        // Direct image/video
        if (!media && rawQuoted?.imageMessage) { media = rawQuoted.imageMessage; mediaType = 'image'; }
        if (!media && rawQuoted?.videoMessage) { media = rawQuoted.videoMessage; mediaType = 'video'; }
        if (!media && rawQuoted?.audioMessage) { media = rawQuoted.audioMessage; mediaType = 'audio'; }
    }

    // m.quoted fallback
    if (!media && m.quoted) {
        const q = m.quoted;
        const mt = (q.mtype || q.type || '').toLowerCase();
        if (mt.includes('image') || (q.mimetype || '').startsWith('image')) { media = q; mediaType = 'image'; }
        else if (mt.includes('video') || (q.mimetype || '').startsWith('video')) { media = q; mediaType = 'video'; }
        else if (mt.includes('audio') || (q.mimetype || '').startsWith('audio')) { media = q; mediaType = 'audio'; }
    }

    if (!media || !mediaType) {
        return reply("*SIRF VIEW ONCE PHOTO, VIDEO YA VOICE QUOTE KARO 🥺*");
    }

    // Reaction
    const emojis = ['🥳', '😃', '🤗', '😊', '♥️'];
    await conn.sendMessage(from, {
        react: { text: emojis[Math.floor(Math.random() * emojis.length)], key: mek.key }
    });

    // Download
    const stream = await downloadContentFromMessage(media, mediaType);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }

    if (!buffer || buffer.length < 100) {
        return reply("❌ Media download fail — dobara try karo");
    }

    const contextInfo = {
        mentionedJid: [sender],
        forwardingScore: 999,
        isForwarded: true,
        externalAdReply: {
            title: "BILAL MD",
            body: "Tap to Join Official Channel",
            thumbnailUrl: "https://i.postimg.cc/7LWBgYMq/bilal.jpg",
            sourceUrl: "https://whatsapp.com/channel/0029Vaj3Xnu17EmtDxTNnQ0G",
            mediaType: 1,
            renderLargerThumbnail: false
        }
    };

    if (mediaType === 'audio') {
        await conn.sendMessage(from, {
            audio: buffer,
            mimetype: media.mimetype || 'audio/mp4',
            ptt: media.ptt || false,
            contextInfo
        }, { quoted: mek });
    } else {
        await conn.sendMessage(from, {
            [mediaType]: buffer,
            caption: media.caption || '*👑 BY :❯ BILAL-MD 👑*',
            mimetype: media.mimetype,
            contextInfo
        }, { quoted: mek });
    }

} catch (err) {
    reply("❌ Error: " + (err?.message || 'Unknown'));
}

});