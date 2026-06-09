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
//                    KICK COMAND
// ============================================================

cmd({
    pattern: "kick",
    alias: ["remove", "ban", "removemember", "kickout", "nikalo", "hatao", "kickmember", "groupkick"],
    desc: "Member ko group se nikalo (reply ya tag karo)",
    category: "group",
    react: "👢",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, reply, sender, isAdmins, isBotAdmins, quoted, participants }) => {
    try {
        // 1. Basic Checks
        if (!isGroup) return reply("*YE COMMAND SIRF GROUPS ME USE KARE 😊*");
        if (!isAdmins) return reply("*YEH COMMAND SIRF GROUP ADMINS OR MERE LIE HAI BAS 😏*");
        if (!isBotAdmins) return reply("*ME ADMIN NAHI HO PEHLE MJHE ADMIN BANAO 🥺*");

        // 2. Target Identify Karo
        let targetJid = null;

        if (m.mentionedJid && m.mentionedJid.length > 0) {
            // Agar user ne tag kiya hai
            targetJid = m.mentionedJid[0];
        } else if (m.quoted && (m.quoted.participant || m.quoted.sender)) {
            // Agar user ne reply kiya hai (Global Patch ki wajah se yahan direct JID milega)
            targetJid = m.quoted.participant || m.quoted.sender;
        } else if (quoted && quoted.participant) {
            // Backup check
            targetJid = quoted.participant;
        }

        if (!targetJid) return reply("*Reply karo ya tag karo jise kick karna hai ❗*");

        // Bot ko self-kick se bachao
        const botJid = conn.user.id.split(':')[0] + '@s.whatsapp.net';
        if (targetJid === botJid) return reply("*Mujhe kick nahi kar sakte 😤*");

        // 3. Participant Validation
        const groupMetadata = await conn.groupMetadata(from);
        const member = groupMetadata.participants.find(p => p.id === targetJid);

        if (!member) return reply("*Yeh member is group mein nahi mila ❗*");
        
        // Admin/Owner protection
        if (member.admin === 'superadmin') return reply("*Group owner ko kick nahi kar sakte 👑*");
        if (member.admin === 'admin') return reply("*Pehle is admin ko demote karo phir kick karo 😏*");

        // 4. Execution (Kick)
        await conn.groupParticipantsUpdate(from, [targetJid], 'remove');

        // 5. Confirmation Message
        await conn.sendMessage(from, {
            text: `👢 *MEMBER KICK HO GAYA*\n\n@${targetJid.split('@')[0]} *ko group se nikaal diya gaya hai* 🚫\n\n> *👑 BILAL-MD WHATSAPP BOT*`,
            mentions: [targetJid],
            contextInfo: {
                externalAdReply: {
                    title: "GROUP SECURITY MANAGER",
                    body: "MEMBER KICKED 👢",
                    thumbnailUrl: "https://i.postimg.cc/7LWBgYMq/bilal.jpg",
                    sourceUrl: "https://whatsapp.com/channel/0029Vaj3Xnu17EmtDxTNnQ0G",
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: mek });

    } catch (e) {
        console.log("KICK ERROR:", e);
        reply("❌ Kick nahi hua: " + (e?.message || 'Unknown Error'));
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
        const mtype = Object.keys(msg?.message || {})[0];
        if (mtype !== 'imageMessage') return reply("*Image reply karo jise group icon set karna hai 🖼️*");

        const media = await conn.downloadMediaMessage(msg);
        await conn.updateProfilePicture(from, media);
        await conn.sendMessage(from, {
            text: `🖼️ *GROUP KI PROFILE PICTURE BADAL GAYI* ✅\n\n> *👑 BILAL-MD WHATSAPP BOT*`,
            contextInfo: {
                externalAdReply: {
                    title: "GROUP MANAGER",
                    body: "GROUP ICON UPDATED 🖼️",
                    thumbnailUrl: "https://i.postimg.cc/7LWBgYMq/bilal.jpg",
                    sourceUrl: "https://whatsapp.com/channel/0029Vaj3Xnu17EmtDxTNnQ0G",
                    mediaType: 1, renderLargerThumbnail: true
                }
            }
        }, { quoted: mek });
    } catch (e) {
        console.log("SET GICON ERROR:", e?.message);
        reply("❌ Icon nahi badla: " + (e?.message || 'Unknown'));
    }
});

// ============================================================
//                    👥 MEMBERS LIST
// ============================================================
cmd({
    pattern: "members",
    alias: ["groupmembers", "memberlist", "listmembers", "gcmembers", "allm", "mlist", "listall"],
    desc: "Group ke sab members ki list dekho",
    category: "group",
    react: "👥",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, reply }) => {
    try {
        if (!isGroup) return reply("*YE COMMAND SIRF GROUPS ME USE KARE 😊*");

        const groupMetadata = await conn.groupMetadata(from);
        const participants = groupMetadata.participants;
        const admins = getGroupAdmins(participants);

        let list = `👥 *${groupMetadata.subject}*\n`;
        list += `━━━━━━━━━━━━━━━━━━━\n`;
        list += `*Total Members:* ${participants.length}\n`;
        list += `*Admins:* ${admins.length}\n`;
        list += `━━━━━━━━━━━━━━━━━━━\n\n`;
        let no = 1;
        for (let p of participants) {
            const num = p.id.split('@')[0];
            const role = p.admin === 'superadmin' ? '👑' : p.admin === 'admin' ? '⭐' : '👤';
            list += `${no}. ${role} +${num}\n`;
            no++;
        }
        list += `\n> *👑 BILAL-MD WHATSAPP BOT*`;
        await conn.sendMessage(from, { text: list }, { quoted: mek });
    } catch (e) {
        console.log("MEMBERS ERROR:", e?.message);
        reply("❌ Members list nahi mili: " + (e?.message || 'Unknown'));
    }
});

// ============================================================
//                    ℹ️ GROUP INFO
// ============================================================
cmd({
    pattern: "groupinfo",
    alias: ["ginfo", "gcinfo", "groupdetails", "gcdetails", "aboutgroup", "gdetail", "gcstat"],
    desc: "Group ki puri info dekho",
    category: "group",
    react: "ℹ️",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, reply }) => {
    try {
        if (!isGroup) return reply("*YE COMMAND SIRF GROUPS ME USE KARE 😊*");

        const groupMetadata = await conn.groupMetadata(from);
        const participants = groupMetadata.participants;
        const admins = getGroupAdmins(participants);
        const created = new Date(groupMetadata.creation * 1000).toLocaleDateString('ur-PK');

        const info =
            `ℹ️ *GROUP INFO*\n` +
            `━━━━━━━━━━━━━━━━━━━\n` +
            `📌 *Naam:* ${groupMetadata.subject}\n` +
            `🆔 *Group ID:* ${from}\n` +
            `👥 *Members:* ${participants.length}\n` +
            `⭐ *Admins:* ${admins.length}\n` +
            `📅 *Bana:* ${created}\n` +
            `📋 *Description:*\n${groupMetadata.desc || 'Koi description nahi'}\n` +
            `━━━━━━━━━━━━━━━━━━━\n` +
            `> *👑 BILAL-MD WHATSAPP BOT*`;

        await conn.sendMessage(from, { text: info }, { quoted: mek });
    } catch (e) {
        console.log("GROUP INFO ERROR:", e?.message);
        reply("❌ Info nahi mili: " + (e?.message || 'Unknown'));
    }
});

// ============================================================
//                    📢 TAG ALL
// ============================================================
cmd({
    pattern: "tagall",
    alias: ["mentionall", "everyone", "all", "tageveryone", "alltag", "pinball", "notifyall", "callall"],
    desc: "Sab members ko tag karo",
    category: "group",
    react: "📢",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, reply, isAdmins, text }) => {
    try {
        if (!isGroup) return reply("*YE COMMAND SIRF GROUPS ME USE KARE 😊*");
        if (!isAdmins) return reply("*YEH COMMAND SIRF GROUP ADMINS OR MERE LIE HAI BAS 😏*");

        const groupMetadata = await conn.groupMetadata(from);
        const participants = groupMetadata.participants;
        let msg = text ? `📢 *${text}*\n\n` : `📢 *ATTENTION EVERYONE!*\n\n`;
        let mentions = [];
        for (let p of participants) {
            mentions.push(p.id);
            msg += `@${p.id.split('@')[0]}\n`;
        }
        msg += `\n> *👑 BILAL-MD WHATSAPP BOT*`;
        await conn.sendMessage(from, { text: msg, mentions }, { quoted: mek });
    } catch (e) {
        console.log("TAGALL ERROR:", e?.message);
        reply("❌ Tag nahi hua: " + (e?.message || 'Unknown'));
    }
});

// ============================================================
//                    👑 TAG ADMINS
// ============================================================
cmd({
    pattern: "tagadmin",
    alias: ["adminping", "alladmin", "mentionadmin", "calladmin", "adminall", "admintag", "pingadmin"],
    desc: "Sirf admins ko tag karo",
    category: "group",
    react: "👑",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, reply, text }) => {
    try {
        if (!isGroup) return reply("*YE COMMAND SIRF GROUPS ME USE KARE 😊*");

        const groupMetadata = await conn.groupMetadata(from);
        const participants = groupMetadata.participants;
        const admins = participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin');
        let msg = text ? `👑 *ADMINS — ${text}*\n\n` : `👑 *ATTENTION ADMINS!*\n\n`;
        let mentions = [];
        for (let a of admins) {
            mentions.push(a.id);
            const role = a.admin === 'superadmin' ? '👑' : '⭐';
            msg += `${role} @${a.id.split('@')[0]}\n`;
        }
        msg += `\n> *👑 BILAL-MD WHATSAPP BOT*`;
        await conn.sendMessage(from, { text: msg, mentions }, { quoted: mek });
    } catch (e) {
        console.log("TAG ADMIN ERROR:", e?.message);
        reply("❌ Admin tag nahi hua: " + (e?.message || 'Unknown'));
    }
});

// ============================================================
//                    🚪 LEAVE GROUP
// ============================================================
cmd({
    pattern: "leave",
    alias: ["leavegroup", "botleave", "gcleave", "exitgroup", "groupexit", "botbye", "leavegc"],
    desc: "Bot group se leave kare",
    category: "group",
    react: "🚪",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, reply, isAdmins }) => {
    try {
        if (!isGroup) return reply("*YE COMMAND SIRF GROUPS ME USE KARE 😊*");
        if (!isAdmins) return reply("*YEH COMMAND SIRF GROUP ADMINS OR MERE LIE HAI BAS 😏*");

        await conn.sendMessage(from, {
            text: `🚪 *BYE BYE EVERYONE!*\n\n*Me is group se ja raha hoon* 😢\n*Allah Hafiz* 🤝\n\n> *👑 BILAL-MD WHATSAPP BOT*`
        }, { quoted: mek });
        setTimeout(async () => { await conn.groupLeave(from); }, 2000);
    } catch (e) {
        console.log("LEAVE ERROR:", e?.message);
        reply("❌ Leave nahi hua: " + (e?.message || 'Unknown'));
    }
});

// ============================================================
//                    🛡️ ANTILINK ON/OFF
// ============================================================
const antilinkGroups = new Set();

cmd({
    pattern: "antilink",
    alias: ["antilinkOn", "linkban", "nolink", "enableantilink", "linkoff", "setantilink"],
    desc: "Group mein antilink on/off karo",
    category: "group",
    react: "🛡️",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, reply, isAdmins, isBotAdmins, args }) => {
    try {
        if (!isGroup) return reply("*YE COMMAND SIRF GROUPS ME USE KARE 😊*");
        if (!isAdmins) return reply("*YEH COMMAND SIRF GROUP ADMINS OR MERE LIE HAI BAS 😏*");
        if (!isBotAdmins) return reply("*ME ADMIN NAHI HO PEHLE MJHE ADMIN BANAO 🥺*");

        const action = args[0]?.toLowerCase();
        if (!action || !['on','off'].includes(action)) return reply("*Use karo: .antilink on / .antilink off*");

        if (action === 'on') {
            antilinkGroups.add(from);
            await conn.sendMessage(from, {
                text: `🛡️ *ANTILINK ON HO GAYA*\n\n*Ab koi bhi link bhejega to usse kick kar diya jayega* 🚫\n\n> *👑 BILAL-MD WHATSAPP BOT*`,
                contextInfo: {
                    externalAdReply: {
                        title: "GROUP SECURITY",
                        body: "ANTILINK: ON 🛡️",
                        thumbnailUrl: "https://i.postimg.cc/7LWBgYMq/bilal.jpg",
                        sourceUrl: "https://whatsapp.com/channel/0029Vaj3Xnu17EmtDxTNnQ0G",
                        mediaType: 1, renderLargerThumbnail: true
                    }
                }
            }, { quoted: mek });
        } else {
            antilinkGroups.delete(from);
            await conn.sendMessage(from, {
                text: `✅ *ANTILINK OFF HO GAYA*\n\n*Ab members links bhej skte hain*\n\n> *👑 BILAL-MD WHATSAPP BOT*`,
                contextInfo: {
                    externalAdReply: {
                        title: "GROUP SECURITY",
                        body: "ANTILINK: OFF ✅",
                        thumbnailUrl: "https://i.postimg.cc/7LWBgYMq/bilal.jpg",
                        sourceUrl: "https://whatsapp.com/channel/0029Vaj3Xnu17EmtDxTNnQ0G",
                        mediaType: 1, renderLargerThumbnail: true
                    }
                }
            }, { quoted: mek });
        }
    } catch (e) {
        console.log("ANTILINK ERROR:", e?.message);
        reply("❌ Antilink error: " + (e?.message || 'Unknown'));
    }
});

// ============================================================
//                    📣 ANNOUNCE / BROADCAST
// ============================================================
cmd({
    pattern: "announce",
    alias: ["broadcast", "gcannounce", "groupannounce", "announcement", "gcbroadcast", "notice"],
    desc: "Group mein announcement bhejo (sab ko tag ke saath)",
    category: "group",
    react: "📣",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, reply, isAdmins, text }) => {
    try {
        if (!isGroup) return reply("*YE COMMAND SIRF GROUPS ME USE KARE 😊*");
        if (!isAdmins) return reply("*YEH COMMAND SIRF GROUP ADMINS OR MERE LIE HAI BAS 😏*");
        if (!text) return reply("*Announcement ka text likho\nExample: .announce Aaj meeting hai*");

        const groupMetadata = await conn.groupMetadata(from);
        const participants = groupMetadata.participants;
        const mentions = participants.map(p => p.id);

        await conn.sendMessage(from, {
            text: `📣 *ANNOUNCEMENT*\n━━━━━━━━━━━━━━━━━━━\n\n${text}\n\n━━━━━━━━━━━━━━━━━━━\n> *👑 BILAL-MD WHATSAPP BOT*`,
            mentions,
            contextInfo: {
                externalAdReply: {
                    title: groupMetadata.subject,
                    body: "GROUP ANNOUNCEMENT 📣",
                    thumbnailUrl: "https://i.postimg.cc/7LWBgYMq/bilal.jpg",
                    sourceUrl: "https://whatsapp.com/channel/0029Vaj3Xnu17EmtDxTNnQ0G",
                    mediaType: 1, renderLargerThumbnail: true
                }
            }
        }, { quoted: mek });
    } catch (e) {
        console.log("ANNOUNCE ERROR:", e?.message);
        reply("❌ Announcement nahi gayi: " + (e?.message || 'Unknown'));
    }
});

// ============================================================
//                    🔔 WELCOME ON/OFF
// ============================================================
const welcomeGroups = new Map();

cmd({
    pattern: "welcome",
    alias: ["setwelcome", "welcomeon", "welcomeoff", "welcomemsg", "joinmsg", "newmember"],
    desc: "Naye member ke liye welcome message on/off karo",
    category: "group",
    react: "🔔",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, reply, isAdmins, args, text }) => {
    try {
        if (!isGroup) return reply("*YE COMMAND SIRF GROUPS ME USE KARE 😊*");
        if (!isAdmins) return reply("*YEH COMMAND SIRF GROUP ADMINS OR MERE LIE HAI BAS 😏*");

        const action = args[0]?.toLowerCase();
        if (!action || !['on','off'].includes(action)) return reply("*Use karo: .welcome on / .welcome off*");

        if (action === 'on') {
            const msg = text?.replace(/^on\s*/i, '').trim() || '🎉 *Welcome @member is group mein!*\n*Humari rules zaroor parhein* 📋';
            welcomeGroups.set(from, msg);
            reply(`🔔 *WELCOME ON HO GAYA* ✅\n\nNew members ko ye message milega:\n\n${msg}`);
        } else {
            welcomeGroups.delete(from);
            reply(`🔕 *WELCOME OFF HO GAYA*`);
        }
    } catch (e) {
        console.log("WELCOME ERROR:", e?.message);
        reply("❌ Welcome error: " + (e?.message || 'Unknown'));
    }
});

// ============================================================
//                    👋 GOODBYE ON/OFF
// ============================================================
const goodbyeGroups = new Set();

cmd({
    pattern: "goodbye",
    alias: ["setgoodbye", "byemsg", "leavemsg", "goodbyeon", "goodbyeoff", "exitwelcome"],
    desc: "Group se jane wale ke liye goodbye message on/off karo",
    category: "group",
    react: "👋",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, reply, isAdmins, args }) => {
    try {
        if (!isGroup) return reply("*YE COMMAND SIRF GROUPS ME USE KARE 😊*");
        if (!isAdmins) return reply("*YEH COMMAND SIRF GROUP ADMINS OR MERE LIE HAI BAS 😏*");

        const action = args[0]?.toLowerCase();
        if (!action || !['on','off'].includes(action)) return reply("*Use karo: .goodbye on / .goodbye off*");

        if (action === 'on') {
            goodbyeGroups.add(from);
            reply(`👋 *GOODBYE ON HO GAYA* ✅\n\nGroup chhodne walo ko goodbye message milega`);
        } else {
            goodbyeGroups.delete(from);
            reply(`❌ *GOODBYE OFF HO GAYA*`);
        }
    } catch (e) {
        console.log("GOODBYE ERROR:", e?.message);
        reply("❌ Goodbye error: " + (e?.message || 'Unknown'));
    }
});

// ============================================================
//         📥 GROUP JOIN/LEAVE HANDLER (Welcome & Goodbye)
// ============================================================
// NOTE: Ye event handler aapke main index.js / connection file
// mein conn.ev.on('group-participants.update') ke andar lagana hai.
// Yahan reference ke liye diya gaya hai:
//
// conn.ev.on('group-participants.update', async ({ id, participants, action }) => {
//     if (action === 'add' && welcomeGroups.has(id)) {
//         for (let jid of participants) {
//             const msg = welcomeGroups.get(id).replace('@member', `@${jid.split('@')[0]}`);
//             await conn.sendMessage(id, { text: msg, mentions: [jid] });
//         }
//     }
//     if (action === 'remove' && goodbyeGroups.has(id)) {
//         for (let jid of participants) {
//             await conn.sendMessage(id, {
//                 text: `👋 *${jid.split('@')[0]} group chhor gaye*\n*Allah Hafiz* 🤝`,
//                 mentions: [jid]
//             });
//         }
//     }
// });

// ============================================================
//                    🔢 MEMBER COUNT
// ============================================================
cmd({
    pattern: "count",
    alias: ["membercount", "gccount", "groupcount", "totalm", "totalmembers", "howmany"],
    desc: "Group mein kitne members hain",
    category: "group",
    react: "🔢",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, reply }) => {
    try {
        if (!isGroup) return reply("*YE COMMAND SIRF GROUPS ME USE KARE 😊*");
        const groupMetadata = await conn.groupMetadata(from);
        const participants = groupMetadata.participants;
        const admins = participants.filter(p => p.admin).length;
        const members = participants.length - admins;

        await conn.sendMessage(from, {
            text: `🔢 *GROUP MEMBER COUNT*\n\n*Group:* ${groupMetadata.subject}\n━━━━━━━━━━━━━━━━━━━\n👥 *Total:* ${participants.length}\n👑 *Admins:* ${admins}\n👤 *Members:* ${members}\n━━━━━━━━━━━━━━━━━━━\n> *👑 BILAL-MD WHATSAPP BOT*`
        }, { quoted: mek });
    } catch (e) {
        console.log("COUNT ERROR:", e?.message);
        reply("❌ Count nahi mila: " + (e?.message || 'Unknown'));
    }
});

// ============================================================
//                    🗑️ DELETE MESSAGE
// ============================================================
cmd({
    pattern: "delete",
    alias: ["del", "delmsg", "deletemsg", "remove", "unsend", "msgdelete", "rmsg"],
    desc: "Bot ka ya kisi ka message delete karo (reply karo)",
    category: "group",
    react: "🗑️",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, reply, isAdmins, isBotAdmins, quoted }) => {
    try {
        if (!isGroup) return reply("*YE COMMAND SIRF GROUPS ME USE KARE 😊*");
        if (!isAdmins) return reply("*YEH COMMAND SIRF GROUP ADMINS OR MERE LIE HAI BAS 😏*");
        if (!isBotAdmins) return reply("*ME ADMIN NAHI HO PEHLE MJHE ADMIN BANAO 🥺*");
        if (!quoted) return reply("*Jis message ko delete karna hai usey reply karo ❗*");

        await conn.sendMessage(from, { delete: quoted.key });
    } catch (e) {
        console.log("DELETE ERROR:", e?.message);
        reply("❌ Delete nahi hua: " + (e?.message || 'Unknown'));
    }
});

// ============================================================
//                    📌 PIN MESSAGE
// ============================================================
cmd({
    pattern: "pin",
    alias: ["pinmsg", "pinmessage", "setpin", "gcpin", "groupppin", "pinit"],
    desc: "Message pin karo (reply karo)",
    category: "group",
    react: "📌",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, reply, isAdmins, isBotAdmins, quoted }) => {
    try {
        if (!isGroup) return reply("*YE COMMAND SIRF GROUPS ME USE KARE 😊*");
        if (!isAdmins) return reply("*YEH COMMAND SIRF GROUP ADMINS OR MERE LIE HAI BAS 😏*");
        if (!isBotAdmins) return reply("*ME ADMIN NAHI HO PEHLE MJHE ADMIN BANAO 🥺*");
        if (!quoted) return reply("*Jis message ko pin karna hai usey reply karo ❗*");

        await conn.sendMessage(from, {
            pin: { type: 1, time: 604800 },
            key: quoted.key
        });
        reply("📌 *Message pin ho gaya!*");
    } catch (e) {
        console.log("PIN ERROR:", e?.message);
        reply("❌ Pin nahi hua: " + (e?.message || 'Unknown'));
    }
});

// ============================================================
//                    📤 UNPIN MESSAGE
// ============================================================
cmd({
    pattern: "unpin",
    alias: ["unpinmsg", "unpinmessage", "removepin", "gcunpin", "unpinit"],
    desc: "Pinned message unpin karo",
    category: "group",
    react: "📤",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, reply, isAdmins, isBotAdmins, quoted }) => {
    try {
        if (!isGroup) return reply("*YE COMMAND SIRF GROUPS ME USE KARE 😊*");
        if (!isAdmins) return reply("*YEH COMMAND SIRF GROUP ADMINS OR MERE LIE HAI BAS 😏*");
        if (!isBotAdmins) return reply("*ME ADMIN NAHI HO PEHLE MJHE ADMIN BANAO 🥺*");
        if (!quoted) return reply("*Pinned message reply karo ❗*");

        await conn.sendMessage(from, {
            pin: { type: 0 },
            key: quoted.key
        });
        reply("📤 *Message unpin ho gaya!*");
    } catch (e) {
        console.log("UNPIN ERROR:", e?.message);
        reply("❌ Unpin nahi hua: " + (e?.message || 'Unknown'));
    }
});

// ============================================================
//                    ⚙️ EDIT PROFILE EDIT SETTING
// ============================================================
cmd({
    pattern: "editgc",
    alias: ["gceditsetting", "editgroup", "allowedit", "onlyAdminEdit", "profileedit", "setedit"],
    desc: "Sirf admins ya sab group info edit kar saken — toggle",
    category: "group",
    react: "⚙️",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, reply, isAdmins, isBotAdmins, args }) => {
    try {
        if (!isGroup) return reply("*YE COMMAND SIRF GROUPS ME USE KARE 😊*");
        if (!isAdmins) return reply("*YEH COMMAND SIRF GROUP ADMINS OR MERE LIE HAI BAS 😏*");
        if (!isBotAdmins) return reply("*ME ADMIN NAHI HO PEHLE MJHE ADMIN BANAO 🥺*");

        const action = args[0]?.toLowerCase();
        if (!action || !['on','off'].includes(action))
            return reply("*Use karo: .editgc on (sirf admins) / .editgc off (sab)*");

        if (action === 'on') {
            await conn.groupSettingUpdate(from, 'locked');
            reply("⚙️ *Group info ab sirf admins edit kar sakte hain* ✅");
        } else {
            await conn.groupSettingUpdate(from, 'unlocked');
            reply("⚙️ *Group info ab sab members edit kar sakte hain* ✅");
        }
    } catch (e) {
        console.log("EDITGC ERROR:", e?.message);
        reply("❌ Setting nahi badli: " + (e?.message || 'Unknown'));
    }
});

// ============================================================
//                    🏷️ MY ROLE / WHO AM I
// ============================================================
cmd({
    pattern: "myrole",
    alias: ["whoami", "mystatus", "myrank", "amiadmin", "checkrole", "role"],
    desc: "Group mein apna role check karo",
    category: "group",
    react: "🏷️",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, reply, sender }) => {
    try {
        if (!isGroup) return reply("*YE COMMAND SIRF GROUPS ME USE KARE 😊*");

        const groupMetadata = await conn.groupMetadata(from);
        const participants = groupMetadata.participants;
        const me = participants.find(p =>
            p.id === sender ||
            p.id.split('@')[0] === sender.split('@')[0]
        );

        const role = me?.admin === 'superadmin' ? '👑 *Group Owner (Super Admin)*'
                   : me?.admin === 'admin'      ? '⭐ *Group Admin*'
                   :                              '👤 *Normal Member*';

        reply(`🏷️ *AAPKA ROLE*\n\n${role}\n\n> *👑 BILAL-MD WHATSAPP BOT*`);
    } catch (e) {
        console.log("MYROLE ERROR:", e?.message);
        reply("❌ Role nahi mila: " + (e?.message || 'Unknown'));
    }
});

// ============================================================
//                    📊 ADMIN LIST
// ============================================================
cmd({
    pattern: "adminlist",
    alias: ["admins", "listadmin", "alladmins", "showadmins", "gcadmins", "groupadmins"],
    desc: "Group ke sab admins ki list",
    category: "group",
    react: "📊",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, reply }) => {
    try {
        if (!isGroup) return reply("*YE COMMAND SIRF GROUPS ME USE KARE 😊*");

        const groupMetadata = await conn.groupMetadata(from);
        const participants = groupMetadata.participants;
        const admins = participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin');

        let list = `📊 *ADMIN LIST — ${groupMetadata.subject}*\n`;
        list += `━━━━━━━━━━━━━━━━━━━\n`;
        list += `*Total Admins:* ${admins.length}\n\n`;
        let no = 1;
        for (let a of admins) {
            const role = a.admin === 'superadmin' ? '👑 Owner' : '⭐ Admin';
            list += `${no}. ${role}: +${a.id.split('@')[0]}\n`;
            no++;
        }
        list += `\n> *👑 BILAL-MD WHATSAPP BOT*`;
        await conn.sendMessage(from, { text: list }, { quoted: mek });
    } catch (e) {
        console.log("ADMINLIST ERROR:", e?.message);
        reply("❌ Admin list nahi mili: " + (e?.message || 'Unknown'));
    }
});

module.exports = { antilinkGroups, welcomeGroups, goodbyeGroups };
