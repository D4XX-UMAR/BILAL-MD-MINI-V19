const { cmd } = require('../command');

cmd({
    pattern: "report",
    alias: ["report", "problem", "errors", "error", "bilal"],
    desc: "Report a broken command to the owner",
    category: "main",
    react: "🐛",
    filename: __filename
},
async (conn, mek, m, { reply, sender }) => {
    try {

        const ownerNumber = "923158930864"; // 👈 Apna number yahan lagao (with country code, no +)
        const ownerJid = ownerNumber + "@s.whatsapp.net";

        const args = m.body.split(" ").slice(1).join(" ");

        if (!args) {
            return await reply(`*🐛 ERROR REPORT COMMAND*

*Kisi bhi command ka error report karne ke liye likho:*

*.bilal [apni problem]*

*📌 Examples:*
*.report yt command work nahi kar raha*
*.report ai command error de raha hai*
*.report video download nahi ho raha*
*.report error video cmnd work nai kr rhe*`);
        }

        const userNumber = sender.split("@")[0];

        // User ka direct WhatsApp chat link
        const chatLink = `https://wa.me/${userNumber}`;

        // Owner ko report + direct link bhejna
        await conn.sendMessage(ownerJid, {
            text: `*🚨 NEW BUG REPORT 🚨*
━━━━━━━━━━━━━━━━━━━━

*👤 User Number:* +${userNumber}
*🔗 Direct Chat:* ${chatLink}

*🐛 Problem:*
${args}

*⏰ Time:* ${new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' })}

━━━━━━━━━━━━━━━━━━━━
`
        });

        // User ko confirmation dena
        await reply(`*✅ Report Successfully Send Ho Gayi!*

*👤 Aapka Number:* +${userNumber}
*🐛 Aapki Problem:* ${args}

*Owner ko bhej di gayi hai aapki report.*
*InshAllah jaldi fix kar denge 😊*

*👑 BILAL-MD SYSTEM 2026 👑*`);

    } catch (e) {
        console.error(e);
        reply("❌ Error aaya report bhejne mein, dobara try karo");
    }
});
       
