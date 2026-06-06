const { cmd } = require('../command');

cmd({
    pattern: "pair",
    alias: ["code", "help", "repo", "sc", "script", "botlink", "getpair", "info"],
    desc: "Simple Reply Command",
    category: "main",
    react: "👑",
    filename: __filename
},
async (conn, mek, m, { reply }) => {
    try {

        // Apna reply yahan lagana
        await reply(`*👑 BILAL-MD WHATSAPP BOT INFO 👑*

*PAKISTAN KA PEHLA BOT BANAYA GAYA HAI URDU ZABAN ME 😊*

*YE BOT TOTALLY FREE HAI APKO KOI PESE DENE KI ZARURAT NAHI FREE FREE😍*

*HOW TO GET FREE BILAL-MD BOT ?*
*APNE NUMBER PER FREE BOT LAGANE KA TARIKA*

*👑 YOUTUBE VIDEO LINK 👑*
*https://youtube.com/shorts/agF6xljjgXw?si=HMhu1pigy-0U7rQ8*

*HOW TO UPDATE BILAL-MD BOT ?*
*BILAL-MD BOT KO UPDATE KESE KARE*

*👑 YOUTUBE VIDEO LINK 👑*
*https://youtu.be/BKxaj1edoYo?si=UXMBqmt4Wg5WzH4A*


*👑 BILAL-MD BOT FEATURES 👑*

👑  YOUTUBE VIDEO DOWNLOAD ER
👑YOUTUBE AUDIO DOWNLOADER
👑 TIKTOK VIDEO DOWNLOADER
👑 FACEBOOK VIDEO DOWNLOADER

*AUR BHI BAHUT SARE FEATURES HAI 😊*

*👑 IMPORTANT MAIN COMMANDS 👑*

👑 AUTO STATUS SEEN
👑 AUTO STATUS REACT
👑 ALWAYS ONLINE SHOW
👑 ANTIBOT COMMAND
👑 ANTILINK COMMAND
👑 BAN COMMAND
👑 UNBAN COMMAND

*ESE AUR BHI BAHUT SARE FEATURES HAI 😊*

*BILAL-MD BOT KA LINK CHAHYE 🥺*

*BOT KA LINK APKO HAMARE OFFICIAL SUPPORT CHANNELS AUR GROUPS ME MILE GA 😊*

 *AP IN CHANNELS KI DESCRIPTION ME CHECK KAR LENA UPDATED LINK MILE GA 😃*

*👑 OFFICE CHANNEL 1 👑*
https://whatsapp.com/channel/0029Vaj3Xnu17EmtDxTNnQ0G

*👑 OFFICIAL CHANNEL 2 👑*
https://whatsapp.com/channel/0029VbCSzfLEQIaggfb0Fj1j

*👑 OFFICIAL SUPPORT GROUP 👑*
https://chat.whatsapp.com/BwWffeDwiqe6cjDDklYJ5m?mode=gi_t

*👑 BILAL-MD SYSTEM 2026 👑*`);

    } catch (e) {
        console.error(e);
        reply("❌ Error");
    }
});