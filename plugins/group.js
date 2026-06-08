const { cmd } = require('../command');
const { isAdmin, isSuperAdmin, getGroupAdmins } = require('../lib/functions');

// ============================================================
//                    🔇 MUTE
// ============================================================
cmd({
    pattern: "mute",
    alias: ["lock", "closegc", "grouplock", "gclock", "mutegc", "lockchat", "silentmode"],
    desc: "Group mute karo — sirf admins msg kar sakte hain",
    category: "group",
    react: "🔇",
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
                    mediaType: 1, renderLargerThumbnail: true
                }
            }
        }, { quoted: mek });
    } catch (e) {
        console.log("MUTE ERROR:", e?.message);
        reply("❌ Mute nahi hua: " + (e?.message || 'Unknown'));
    }
});

// ============================================================
//                    🔊 UNMUTE
// ============================================================
cmd({
    pattern: "unmute",
    alias: ["unlock", "opengc", "groupunlock", "gcunlock", "unmutegc", "openchat", "unsilent"],
    desc: "Group unmute karo — sab msg kar sakte hain",
    category: "group",
    react: "🔊",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, reply, sender, isAdmins, isBotAdmins }) => {
    try {
        if (!isGroup) return reply("*YE COMMAND SIRF GROUPS ME USE KARE 😊*");
        if (!isAdmins) return reply("*YEH COMMAND SIRF GROUP ADMINS OR MERE LIE HAI BAS 😏*");
        if (!isBotAdmins) return reply("*GROUP CHATTING OFF NAHI HO RAHI Q K ME ADMIN NAHI HO PEHLE MJHE ADMIN BANAY 🥺*");
        await conn.groupSettingUpdate(from, 'not_announcement');
        await conn.sendMessage(from, {
            text: `🔓 *GROUP CHAT OPEN HO GAYA*\n\n*AB AP SAB MEMBERS IS GROUP ME MSG KR SKTE HO 😊*\n\n> *👑 BILAL-MD WHATSAPP BOT*`,
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 999,
                isForwarded: true,
                externalAdReply: {
                    title: "GROUP SECURITY MANAGER",
                    body: "GROUP STATUS: UNMUTED 🔓",
                    thumbnailUrl: "https://i.postimg.cc/7LWBgYMq/bilal.jpg",
                    sourceUrl: "https://whatsapp.com/channel/0029Vaj3Xnu17EmtDxTNnQ0G",
                    mediaType: 1, renderLargerThumbnail: true
                }
            }
        }, { quoted: mek });
    } catch (e) {
        console.log("UNMUTE ERROR:", e?.message);
        reply("❌ Unmute nahi hua: " + (e?.message || 'Unknown'));
    }
});

// ============================================================
//                    👢 KICK / REMOVE
// ============================================================
cmd({
    pattern: "kick",
    alias: ["remove", "ban", "removemember", "kickout", "nikalo", "hatao", "kickmember", "groupkick"],
    desc: "Member ko group se nikalo (reply ya tag karo)",
    category: "group",
    react: "👢",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, reply, sender, isAdmins, isBotAdmins, quoted, mentionByTag }) => {
    try {
        if (!isGroup) return reply("*YE COMMAND SIRF GROUPS ME USE KARE 😊*");
        if (!isAdmins) return reply("*YEH COMMAND SIRF GROUP ADMINS OR MERE LIE HAI BAS 😏*");
        if (!isBotAdmins) return reply("*ME ADMIN NAHI HO PEHLE MJHE ADMIN BANAO 🥺*");

        const groupMetadata = await conn.groupMetadata(from);
        const participants = groupMetadata.participants;

        let kickJid = mentionByTag?.[0] || quoted?.sender || null;
        if (!kickJid) return reply("*Reply karo ya tag karo jise kick karna hai ❗*");

        const botJid = conn.user.id.split(':')[0] + '@s.whatsapp.net';
        if (kickJid === botJid) return reply("*Mujhe kick nahi kar sakte 😤*");

        if (isSuperAdmin(participants, kickJid)) return reply("*Group owner ko kick nahi kar sakte 👑*");
        if (isAdmin(participants, kickJid)) return reply("*Pehle is admin ko demote karo phir kick karo 😏*");

        await conn.groupParticipantsUpdate(from, [kickJid], 'remove');
        await conn.sendMessage(from, {
            text: `👢 *MEMBER KICK HO GAYA*\n\n@${kickJid.split('@')[0]} *ko group se nikaal diya gaya hai* 🚫\n\n> *👑 BILAL-MD WHATSAPP BOT*`,
            mentions: [kickJid],
            contextInfo: {
                externalAdReply: {
                    title: "GROUP SECURITY MANAGER",
                    body: "MEMBER KICKED 👢",
                    thumbnailUrl: "https://i.postimg.cc/7LWBgYMq/bilal.jpg",
                    sourceUrl: "https://whatsapp.com/channel/0029Vaj3Xnu17EmtDxTNnQ0G",
                    mediaType: 1, renderLargerThumbnail: true
                }
            }
        }, { quoted: mek });
    } catch (e) {
        console.log("KICK ERROR:", e?.message);
        reply("❌ Kick nahi hua: " + (e?.message || 'Unknown'));
    }
});

// ============================================================
//                    ➕ ADD MEMBER
// ============================================================
cmd({
    pattern: "add",
    alias: ["addmember", "adduser", "groupadd", "gcadd", "addno", "addnumber", "invite"],
    desc: "Number se member add karo",
    category: "group",
    react: "➕",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, reply, sender, isAdmins, isBotAdmins, args }) => {
    try {
        if (!isGroup) return reply("*YE COMMAND SIRF GROUPS ME USE KARE 😊*");
        if (!isAdmins) return reply("*YEH COMMAND SIRF GROUP ADMINS OR MERE LIE HAI BAS 😏*");
        if (!isBotAdmins) return reply("*ME ADMIN NAHI HO PEHLE MJHE ADMIN BANAO 🥺*");
        if (!args[0]) return reply("*Number do jise add karna hai\nExample: .add 923001234567*");

        let number = args[0].replace(/[^0-9]/g, '');
        let jid = number + '@s.whatsapp.net';
        const result = await conn.groupParticipantsUpdate(from, [jid], 'add');
        const status = result?.[0]?.status;

        if (status === '200') {
            await conn.sendMessage(from, {
                text: `✅ *MEMBER ADD HO GAYA*\n\n@${number} *ko group mein add kar diya gaya hai* 🎉\n\n> *👑 BILAL-MD WHATSAPP BOT*`,
                mentions: [jid],
                contextInfo: {
                    externalAdReply: {
                        title: "GROUP MANAGER",
                        body: "MEMBER ADDED ✅",
                        thumbnailUrl: "https://i.postimg.cc/7LWBgYMq/bilal.jpg",
                        sourceUrl: "https://whatsapp.com/channel/0029Vaj3Xnu17EmtDxTNnQ0G",
                        mediaType: 1, renderLargerThumbnail: true
                    }
                }
            }, { quoted: mek });
        } else if (status === '403') {
            reply(`❌ *${number} ne privacy settings ki wajah se add hone se roka hai*`);
        } else if (status === '408') {
            reply(`❌ *${number} WhatsApp pe nahi hai*`);
        } else {
            reply(`⚠️ *Add nahi ho saka — Status: ${status}*`);
        }
    } catch (e) {
        console.log("ADD ERROR:", e?.message);
        reply("❌ Add nahi hua: " + (e?.message || 'Unknown'));
    }
});

// ============================================================
//                    ⬆️ PROMOTE
// ============================================================
cmd({
    pattern: "promote",
    alias: ["adminbana", "makeadmin", "addadmin", "setadmin", "adminadd", "adminko", "banaadmin", "upadmin"],
    desc: "Member ko admin banao (reply ya tag karo)",
    category: "group",
    react: "⬆️",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, reply, sender, isAdmins, isBotAdmins, quoted, mentionByTag }) => {
    try {
        if (!isGroup) return reply("*YE COMMAND SIRF GROUPS ME USE KARE 😊*");
        if (!isAdmins) return reply("*YEH COMMAND SIRF GROUP ADMINS OR MERE LIE HAI BAS 😏*");
        if (!isBotAdmins) return reply("*ME ADMIN NAHI HO PEHLE MJHE ADMIN BANAO 🥺*");

        const groupMetadata = await conn.groupMetadata(from);
        const participants = groupMetadata.participants;
        let targetJid = mentionByTag?.[0] || quoted?.sender || null;
        if (!targetJid) return reply("*Reply karo ya tag karo jise admin banana hai ❗*");
        if (isAdmin(participants, targetJid)) return reply("*Ye member pehle se hi admin hai 😏*");

        await conn.groupParticipantsUpdate(from, [targetJid], 'promote');
        await conn.sendMessage(from, {
            text: `⬆️ *NAYA ADMIN BAN GAYA* 👑\n\n@${targetJid.split('@')[0]} *ab is group ka admin hai*\n*Congratulations! 🎉*\n\n> *👑 BILAL-MD WHATSAPP BOT*`,
            mentions: [targetJid],
            contextInfo: {
                externalAdReply: {
                    title: "GROUP MANAGER",
                    body: "NEW ADMIN PROMOTED ⬆️",
                    thumbnailUrl: "https://i.postimg.cc/7LWBgYMq/bilal.jpg",
                    sourceUrl: "https://whatsapp.com/channel/0029Vaj3Xnu17EmtDxTNnQ0G",
                    mediaType: 1, renderLargerThumbnail: true
                }
            }
        }, { quoted: mek });
    } catch (e) {
        console.log("PROMOTE ERROR:", e?.message);
        reply("❌ Promote nahi hua: " + (e?.message || 'Unknown'));
    }
});

// ============================================================
//                    ⬇️ DEMOTE
// ============================================================
cmd({
    pattern: "demote",
    alias: ["adminhat", "removeadmin", "unadmin", "adminremove", "deadmin", "hatoadmin", "downadmin"],
    desc: "Admin ko normal member banao (reply ya tag karo)",
    category: "group",
    react: "⬇️",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, reply, sender, isAdmins, isBotAdmins, quoted, mentionByTag }) => {
    try {
        if (!isGroup) return reply("*YE COMMAND SIRF GROUPS ME USE KARE 😊*");
        if (!isAdmins) return reply("*YEH COMMAND SIRF GROUP ADMINS OR MERE LIE HAI BAS 😏*");
        if (!isBotAdmins) return reply("*ME ADMIN NAHI HO PEHLE MJHE ADMIN BANAO 🥺*");

        const groupMetadata = await conn.groupMetadata(from);
        const participants = groupMetadata.participants;
        let targetJid = mentionByTag?.[0] || quoted?.sender || null;
        if (!targetJid) return reply("*Reply karo ya tag karo jise demote karna hai ❗*");
        if (!isAdmin(participants, targetJid)) return reply("*Ye member admin hi nahi hai 😏*");
        if (isSuperAdmin(participants, targetJid)) return reply("*Group owner ko demote nahi kar sakte 👑*");

        await conn.groupParticipantsUpdate(from, [targetJid], 'demote');
        await conn.sendMessage(from, {
            text: `⬇️ *ADMIN HATAYA GAYA*\n\n@${targetJid.split('@')[0]} *ki admin status remove ho gayi*\n*Ab ye normal member hai*\n\n> *👑 BILAL-MD WHATSAPP BOT*`,
            mentions: [targetJid],
            contextInfo: {
                externalAdReply: {
                    title: "GROUP MANAGER",
                    body: "ADMIN DEMOTED ⬇️",
                    thumbnailUrl: "https://i.postimg.cc/7LWBgYMq/bilal.jpg",
                    sourceUrl: "https://whatsapp.com/channel/0029Vaj3Xnu17EmtDxTNnQ0G",
                    mediaType: 1, renderLargerThumbnail: true
                }
            }
        }, { quoted: mek });
    } catch (e) {
        console.log("DEMOTE ERROR:", e?.message);
        reply("❌ Demote nahi hua: " + (e?.message || 'Unknown'));
    }
});

// ============================================================
//                    🔗 INVITE LINK
// ============================================================
cmd({
    pattern: "invitelink",
    alias: ["link", "getlink", "grouplink", "gclink", "sharelink", "joinlink", "invitecode"],
    desc: "Group ka invite link nikalo",
    category: "group",
    react: "🔗",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, reply, isAdmins, isBotAdmins }) => {
    try {
        if (!isGroup) return reply("*YE COMMAND SIRF GROUPS ME USE KARE 😊*");
        if (!isAdmins) return reply("*YEH COMMAND SIRF GROUP ADMINS OR MERE LIE HAI BAS 😏*");
        if (!isBotAdmins) return reply("*ME ADMIN NAHI HO PEHLE MJHE ADMIN BANAO 🥺*");

        const groupMetadata = await conn.groupMetadata(from);
        const inviteCode = await conn.groupInviteCode(from);
        const link = `https://chat.whatsapp.com/${inviteCode}`;

        await conn.sendMessage(from, {
            text: `🔗 *GROUP INVITE LINK*\n\n*Group:* ${groupMetadata.subject}\n*Link:* ${link}\n\n⚠️ *Ye link sirf trusted logo ko share karo*\n\n> *👑 BILAL-MD WHATSAPP BOT*`,
            contextInfo: {
                externalAdReply: {
                    title: groupMetadata.subject,
                    body: "GROUP INVITE LINK 🔗",
                    thumbnailUrl: "https://i.postimg.cc/7LWBgYMq/bilal.jpg",
                    sourceUrl: link,
                    mediaType: 1, renderLargerThumbnail: true
                }
            }
        }, { quoted: mek });
    } catch (e) {
        console.log("INVITE LINK ERROR:", e?.message);
        reply("❌ Link nahi mila: " + (e?.message || 'Unknown'));
    }
});

// ============================================================
//                    🔄 REVOKE LINK
// ============================================================
cmd({
    pattern: "revokelink",
    alias: ["resetlink", "newlink", "linkchange", "changelink", "linkreset", "newgclink"],
    desc: "Group ka invite link reset karo",
    category: "group",
    react: "🔄",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, reply, isAdmins, isBotAdmins }) => {
    try {
        if (!isGroup) return reply("*YE COMMAND SIRF GROUPS ME USE KARE 😊*");
        if (!isAdmins) return reply("*YEH COMMAND SIRF GROUP ADMINS OR MERE LIE HAI BAS 😏*");
        if (!isBotAdmins) return reply("*ME ADMIN NAHI HO PEHLE MJHE ADMIN BANAO 🥺*");

        await conn.groupRevokeInvite(from);
        const newCode = await conn.groupInviteCode(from);
        const newLink = `https://chat.whatsapp.com/${newCode}`;

        await conn.sendMessage(from, {
            text: `🔄 *INVITE LINK RESET HO GAYA*\n\n*Naya Link:* ${newLink}\n\n⚠️ *Purana link ab kaam nahi karega*\n\n> *👑 BILAL-MD WHATSAPP BOT*`,
            contextInfo: {
                externalAdReply: {
                    title: "GROUP SECURITY MANAGER",
                    body: "LINK REVOKED & RESET 🔄",
                    thumbnailUrl: "https://i.postimg.cc/7LWBgYMq/bilal.jpg",
                    sourceUrl: newLink,
                    mediaType: 1, renderLargerThumbnail: true
                }
            }
        }, { quoted: mek });
    } catch (e) {
        console.log("REVOKE LINK ERROR:", e?.message);
        reply("❌ Link reset nahi hua: " + (e?.message || 'Unknown'));
    }
});

// ============================================================
//                    📝 GROUP NAME
// ============================================================
cmd({
    pattern: "setgname",
    alias: ["groupname", "setname", "renamegc", "gcname", "changename", "updategcname", "grouprename"],
    desc: "Group ka naam badlo",
    category: "group",
    react: "📝",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, reply, isAdmins, isBotAdmins, text }) => {
    try {
        if (!isGroup) return reply("*YE COMMAND SIRF GROUPS ME USE KARE 😊*");
        if (!isAdmins) return reply("*YEH COMMAND SIRF GROUP ADMINS OR MERE LIE HAI BAS 😏*");
        if (!isBotAdmins) return reply("*ME ADMIN NAHI HO PEHLE MJHE ADMIN BANAO 🥺*");
        if (!text) return reply("*Naya naam likho\nExample: .setgname Mera Group*");

        await conn.groupUpdateSubject(from, text.trim());
        await conn.sendMessage(from, {
            text: `📝 *GROUP KA NAAM BADAL GAYA*\n\n*Naya Naam:* ${text.trim()}\n\n> *👑 BILAL-MD WHATSAPP BOT*`,
            contextInfo: {
                externalAdReply: {
                    title: "GROUP MANAGER",
                    body: "GROUP NAME UPDATED 📝",
                    thumbnailUrl: "https://i.postimg.cc/7LWBgYMq/bilal.jpg",
                    sourceUrl: "https://whatsapp.com/channel/0029Vaj3Xnu17EmtDxTNnQ0G",
                    mediaType: 1, renderLargerThumbnail: true
                }
            }
        }, { quoted: mek });
    } catch (e) {
        console.log("SET GNAME ERROR:", e?.message);
        reply("❌ Naam nahi badla: " + (e?.message || 'Unknown'));
    }
});

// ============================================================
//                    📋 GROUP DESCRIPTION
// ============================================================
cmd({
    pattern: "setgdesc",
    alias: ["groupdesc", "setdesc", "gcdesc", "changedesc", "updatedesc", "gcbio", "groupbio"],
    desc: "Group ki description badlo",
    category: "group",
    react: "📋",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, reply, isAdmins, isBotAdmins, text }) => {
    try {
        if (!isGroup) return reply("*YE COMMAND SIRF GROUPS ME USE KARE 😊*");
        if (!isAdmins) return reply("*YEH COMMAND SIRF GROUP ADMINS OR MERE LIE HAI BAS 😏*");
        if (!isBotAdmins) return reply("*ME ADMIN NAHI HO PEHLE MJHE ADMIN BANAO 🥺*");
        if (!text) return reply("*Description likho\nExample: .setgdesc Ye mera group hai*");

        await conn.groupUpdateDescription(from, text.trim());
        await conn.sendMessage(from, {
            text: `📋 *GROUP DESCRIPTION BADAL GAYI*\n\n*Nayi Description:*\n${text.trim()}\n\n> *👑 BILAL-MD WHATSAPP BOT*`,
            contextInfo: {
                externalAdReply: {
                    title: "GROUP MANAGER",
                    body: "DESCRIPTION UPDATED 📋",
                    thumbnailUrl: "https://i.postimg.cc/7LWBgYMq/bilal.jpg",
                    sourceUrl: "https://whatsapp.com/channel/0029Vaj3Xnu17EmtDxTNnQ0G",
                    mediaType: 1, renderLargerThumbnail: true
                }
            }
        }, { quoted: mek });
    } catch (e) {
        console.log("SET GDESC ERROR:", e?.message);
        reply("❌ Description nahi badli: " + (e?.message || 'Unknown'));
    }
});

// ============================================================
//                    🖼️ GROUP ICON / DP
// ============================================================
cmd({
    pattern: "setgicon",
    alias: ["groupicon", "setgdp", "groupdp", "gcicon", "gcdp", "setgpic", "gcpic", "changegcpic"],
    desc: "Group ki profile picture badlo (image reply karo)",
    category: "group",
    react: "🖼️",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, reply, isAdmins, isBotAdmins, quoted }) => {
    try {
        if (!isGroup) return reply("*YE COMMAND SIRF GROUPS ME USE KARE 😊*");
        if (!isAdmins) return reply("*YEH COMMAND SIRF GROUP ADMINS OR MERE LIE HAI BAS 😏*");
        if (!isBotAdmins) return reply("*ME ADMIN NAHI HO PEHLE MJHE ADMIN BANAO 🥺*");

        const msg = quoted || mek;
        const mtype = Object.keys(msg?.message
