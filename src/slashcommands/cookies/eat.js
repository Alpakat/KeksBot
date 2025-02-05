const discord = require('discord.js')
const embeds = require('../../embeds')
const update = require('../../db/update')

module.exports = {
    name: 'eat',
    description: 'Konvertiert deine Kekse zu Erfahrungspunkten',
    battlelock: true,
    options: [
        {
            name: 'count',
            description: 'Anzahl der Kekse, die du essen willst',
            type: 'INTEGER',
            required: true
        }
    ],
    async execute(ita, args, client) {
        var { guild, user, color } = ita
        if(args.count <= 0) return embeds.error(ita, ita.user.id, 'Syntaxfehler', 'Bitte gib eine positive Zahl an. Keiner will, dass du Kekse kotzt.')

        if(!user.data.cookies) user.data.cookies = 0
        if(!user.data.xp) user.data.xp = 0
        if(!user.data.level) user.data.level = 1

        if(args.count > user.data.cookies) args.count = user.data.cookies

        if(!args.count && user.data.cookies) return embeds.success(ita, 'NomNom', 'Oder auch nicht.', true)
        else if(!user.data.cookies) return embeds.error(ita, 'Fehler', 'Du kannst keine Kekse essen D:\nBenutz zuerst `/cookies`, um welche zu bekommen.', true)

        user.data.xp += args.count
        user.data.cookies -= args.count
        let levelup = false
        let scanning = true
        let neededxp = 0
        let levelcount = 0

        while (scanning) {
            if(user.data.level <= 15 && (user.data.level + 1) ** 3 * ((24 + Math.floor((user.data.level + 2) / 3)) / 3) <= user.data.xp) {
                user.data.level++
                levelup = true
                levelcount++
            } else if(user.data.level <= 36 && user.data.level > 15 && (user.data.level + 1) ** 3 * ((15 + user.data.level) / 3) <= user.data.xp) {
                user.data.level++
                levelup = true
                levelcount++
            } else if(user.data.level < 100 && user.data.level > 37 && (user.data.level + 1) ** 3 * ((32 + Math.floor((user.data.level + 1) / 2)) / 3)) {
                user.data.level++
                levelup = true
                levelcount++
            } else scanning = false
        }

        neededxp = 
            (user.data.level <= 15) ? Math.ceil((user.data.level + 1) ** 3 * ((24 + Math.floor((user.data.level + 2) / 3)) / 3)) : 
            (user.data.level <= 36) ? Math.ceil((user.data.level + 1) ** 3 * ((15 + user.data.level) / 3)) :
            (user.data.level < 100) ? Math.ceil((user.data.level + 1) ** 3 * ((32 + Math.floor((user.data.level + 1) / 2)) / 3)) :
            user.data.xp

        await update('userdata', user.id, { cookies: user.data.cookies, xp: user.data.xp, level: user.data.level })

        var embed = new discord.MessageEmbed()
        if(levelup) {
            client.emit('userLevelUp', ita, levelcount)
        } else {
            embed
                .setColor(color.lime)
                .setTitle(`${require('../../emotes.json').accept} Kekse gegessen`)
                .setDescription(`Du hast ${args.count} Kekse gegessen.\nDadurch hast du nun ${user.data.xp} Erfahrungspunkte. Es fehlen noch ${neededxp - user.data.xp} Erfahrungspunkte, um Level ${user.data.level + 1} zu erreichen.`.replace('fehlen noch 1 Erfahrungspunkte', 'fehlt noch ein Erfahrungspunkt').replace(' 1 Erfahrungspunkte', ' einen Erfahrungspunkt'))
            await ita.reply({ embeds: [embed], ephemeral: true})
        }
    }
}