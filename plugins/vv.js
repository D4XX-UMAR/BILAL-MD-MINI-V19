const { cmd } = require('../command');
const { downloadContentFromMessage, getContentType, extractMessageContent } = require('@whiskeysockets/baileys');

cmd({
    pattern: "vv",
    alias: ["viewonce", "reveal", "open", "show"],
    desc: "Reveal view-once image or video",
    category: "tools",
    react: "👑",
    filename: __filename
},
async (conn, mek, m, { from, sender, reply }) => {
    try {

        // ─── QUOTED CHECK ───
        const quoted = m.quoted || null;
        if (!quoted) {
            return reply(
                "*APKO KISI NE PRIVATE PHOTO VIDEO YA VOICE BHEJI HAI 😟*\n" +
                "*AUR AP USE BAR BAR DEKHNA CHAHTE HAI 😄*\n\n" +
                "*US MSG KO QUOTE KARO AUR PHIR LIKHO ❮VV❯*"
            );
        }

        // ─── BAILEYS V7: extractMessageContent se inner message nikalo ───
        // viewOnceMessageV2, viewOnceMessageV2Extension, viewOnceMessage
        // teeno ko handle karta hai extractMessageContent
        const rawMsg = quoted.message || {};

        let mediaMsg = null;
        let mediaType = null;

        // Priority order: V2 > V2Extension > V1 > plain quoted
        const voV2     = rawMsg?.viewOnceMessageV2?.message;
        const voV2Ext  = rawMsg?.viewOnceMessageV2Extension?.message;
        const voV1     = rawMsg?.viewOnceMessage?.message;

        const innerMsg = voV2 || voV2Ext || voV1 || null;

        if (innerMsg) {
            // Actual view once — andar se type nikalo
            mediaType = Object.keys(innerMsg).find(k =>
                k === 'imageMessage' || k === 'videoMessage'
            );
            mediaMsg = mediaType ? innerMsg[mediaType] : null;
        } else {
            // Normal quoted image/video (already opened once)
            mediaType = Object.keys(rawMsg).find(k =>
                k === 'imageMessage' || k === 'videoMessage'
            );
            mediaMsg = mediaType ? rawMsg[mediaType] : null;
        }

        if (!mediaMsg || !mediaType) {
            return reply("*SIRF VIEW ONCE CHIZ KO MENTION KARO BAS*");
        }

        // ─── REACTION ───
        const emojis = ['😃'];
        await conn.sendMessage(from, {
            react: {
                text: emojis[Math.floor(Math.random() * emojis.length)],
                key: mek.key
            }
        });

        // ─── BAILEYS V7: updateMediaMessage — missing media fix ───
        // Agar mediaMsg me directPath/mediaKey missing ho to update karo
        let finalMediaMsg = mediaMsg;
        try {
            if (!mediaMsg.mediaKey || !mediaMsg.directPath) {
                const updated = await conn.updateMediaMessage(quoted);
                const updatedInner =
                    updated?.message?.viewOnceMessageV2?.message ||
                    updated?.message?.viewOnceMessageV2Extension?.message ||
                    updated?.message?.viewOnceMessage?.message ||
                    updated?.message;
                if (updatedInner?.[mediaType]) {
                    finalMediaMsg = updatedInner[mediaType];
                }
            }
        } catch (e) {
            // updateMediaMessage available nahi to skip
        }

        // ─── DOWNLOAD ───
        const stream = await downloadContentFromMessage(
            finalMediaMsg,
            mediaType === 'imageMessage' ? 'image' : 'video'
        );

        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        if (!buffer || buffer.length === 0) {
            return reply("*DUBARA KOSHISH KARO 😊*");
        }

        // ─── SEND ───
        await conn.sendMessage(from, {
            [mediaType === 'imageMessage' ? 'image' : 'video']: buffer,
            caption: finalMediaMsg.caption || '> *BILAL-MD*',
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 999,
                isForwarded: true,
                externalAdReply: {
                    title: "VV SUCCESSED",
                    body: "Tap to Join Official Channel",
                    thumbnailUrl: "https://i.postimg.cc/7LWBgYMq/bilal.jpg",
                    sourceUrl: "https://whatsapp.com/channel/0029Vaj3Xnu17EmtDxTNnQ0G",
                    mediaType: 1,
                    renderLargerThumbnail: false
                }
            }
        }, { quoted: mek });

    } catch (err) {
        console.error("VV Command Error:", err);
        reply(`❌ Error: ${err.message}`);
    }
});
       
