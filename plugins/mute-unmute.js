const { cmd } = require('../command');

// --- MUTE ---
cmd({
    pattern: "mute",
    alias: ["lock", "closegc"],
    desc: "Group mute karo",
    category: "group",
    react: "👑",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, reply, sender, isAdmins, isBotAdmins }) => {
    try {
        if (!isGroup) return reply("*YE COMMAND SIRF GROUPS ME USE KARE 😊*");
        if (!isAdmins) return reply("*YEH COMMAND SIRF GROUP ADMINS OR MERE LIE HAI BAS 😏*");
        if (!isBotAdmins) return reply("*GROUP CHATTING OFF NAHI HO RAHI Q K ME ADMIN NAHI HO PEHLE MJHE ADMIN BANAY 🥺*");

        await conn.groupSettingUpdate(from, 'announcement');

        await conn.sendMessage(from, {
            text: `🔒 *GROUP CHAT OFF HO GAYA*\n\n*AB SIRF ADMINS MSG KR SKTE HAI 😊*\n\n> *👑 BILAL-MD WHATSAPP BOT*`,
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 999,
                isForwarded: true,
                externalAdReply: {
                    title: "GROUP SECURITY MANAGER",
                    body: "GROUP STATUS: MUTED 🔒",
                    thumbnailUrl: "https://i.postimg.cc/7LWBgYMq/bilal.jpg",
                    sourceUrl: "https://whatsapp.com/channel/0029Vaj3Xnu17EmtDxTNnQ0G",
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: mek });

    } catch (e) {
        console.log("MUTE ERROR:", e?.message);
        reply("❌ Mute nahi hua: " + (e?.message || 'Unknown'));
    }
});

// --- UNMUTE ---
cmd({
    pattern: "unmute",
    alias: ["unlock", "opengc"],
    desc: "Group unmute karo",
    category: "group",
    react: "👑",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, reply, sender, isAdmins, isBotAdmins }) => {
    try {
        if (!isGroup) return reply("*YE COMMAND SIRF GROUPS ME USE KARE 😊*");
        if (!isAdmins) return reply("*YEH COMMAND SIRF GROUP ADMINS OR MERE LIE HAI BAS 😏*");
        if (!isBotAdmins) return reply("*GROUP CHATTING OFF NAHI HO RAHI Q K ME ADMIN NAHI HO PEHLE MJHE ADMIN BANAY 🥺*");

        await conn.groupSettingUpdate(from, 'not_announcement');

        await conn.sendMessage(from, {
            text: `🔓 *GROUP CHAT OPEN HO GAYA*\n\n*AB AP SAB MEMBERS IS GROUP ME MSG KR SKTE HO 😊*\n\n> *👑 BILAL-MD*`,
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 999,
                isForwarded: true,
                externalAdReply: {
                    title: "GROUP SECURITY MANAGER",
                    body: "GROUP STATUS: UNMUTED 🔓",
                    thumbnailUrl: "https://i.postimg.cc/7LWBgYMq/bilal.jpg",
                    sourceUrl: "https://whatsapp.com/channel/0029Vaj3Xnu17EmtDxTNnQ0G",
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: mek });

    } catch (e) {
        console.log("UNMUTE ERROR:", e?.message);
        reply("❌ Unmute nahi hua: " + (e?.message || 'Unknown'));
    }
});
      
