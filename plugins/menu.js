const config = require('../config')
const { cmd, commands } = require('../command')
const { runtime } = require('../lib/functions')
const fs = require('fs')

cmd({
pattern: "menu",
alias: ["allmenu", "fullmenu", "list", "m"],
desc: "Show all bot commands",
category: "menu",
react: "👑",
filename: __filename
},
async (conn, mek, m, { from }) => {
try {

    // Group commands by category
    let categories = {}

    commands.forEach(cmd => {
        if (!cmd.category) return
        if (!categories[cmd.category]) categories[cmd.category] = []
        categories[cmd.category].push(cmd.pattern)
    })

    // Pair.js menu commands auto fetch
    let pairCommands = []

    try {
        const pairCode = fs.readFileSync('./pair.js', 'utf8')

        const start = pairCode.indexOf('// MENU_COMMANDS_START')
        const end = pairCode.indexOf('// MENU_COMMANDS_END')

        if (start !== -1 && end !== -1) {
            const section = pairCode.substring(start, end)

            const matches = [...section.matchAll(/\/\/MENU_CMD:(.*)/g)]

pairCommands = [...new Set(matches.map(x => x[1].trim()))]

        }
    } catch (err) {
        console.log('Pair menu scan error:', err)
    }

    // Header
    let menu = `*╭━━══•👑 BILAL-MD 👑•══━━••⊷*
║ 👑 USER :❯ ${config.OWNER_NAME}
║ 👑 PREFIX :❯ ❮  ${config.PREFIX}  ❯
║ 👑 PLATFORM :❯ bilal.arm64.x3hz
║ 👑 UPTIME :❯ ${runtime(process.uptime())}
*╰━━══•👑 CMNDS 👑•══━━••⊷*
`

    // Build menu dynamically
    for (let category in categories) {
        menu += `\n*╭━━══•*👑 ${category.toUpperCase()} 👑*•══━━••⊷*
 `

        categories[category].forEach(cmd => {
            menu += `*║ 👑 . ${config.PREFIX}${cmd}*\n`
        })

        menu += `*╰━━══••══━━••⊷*\n\n
`
}

    // Pair.js Commands
    if (pairCommands.length) {

        menu += `*╭━━══•👑 SETTINGS 👑•══━━••⊷*
`

        pairCommands.forEach(cmd => {
            menu += `*║ 👑 ${config.PREFIX}${cmd}*\n`
        })

        menu += `*╰━━══••══━━••⊷*
`
}

    // Footer
    menu += `\n\n*${config.DESCRIPTION || '👑 BILAL-MD WHATSAPP BOT 👑'}*
`

    // Send as forwarded newsletter message
    await conn.sendMessage(from, {
        image: {
            url: config.MENU_IMAGE_URL || 'https://i.postimg.cc/7LWBgYMq/bilal.jpg'
        },
        caption: menu,
        contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            externalAdReply: {
                showAdAttribution: true,
                title: `BILAL-MD MULTIDEVICE`,
                body: config.DESCRIPTION || 'WHATSAPP BOT',
                mediaType: 2,
                mediaUrl: 'https://whatsapp.com/channel/0029Vaj3Xnu17EmtDxTNnQ0G',
                thumbnail: {
                    url: config.MENU_IMAGE_URL || 'https://i.postimg.cc/7LWBgYMq/bilal.jpg'
                },
                sourceUrl: 'https://whatsapp.com/channel/0029Vaj3Xnu17EmtDxTNnQ0G'
            },
            mentionedJid: [m.sender]
        }
    }, {
        quoted: mek
    })

} catch (e) {
    console.log(e)
}

})