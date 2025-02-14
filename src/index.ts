import Discord from 'discord.js'
const client: Discord.Client = new Discord.Client({ intents: ['Guilds', 'GuildMembers', 'GuildEmojisAndStickers', 'DirectMessages', 'DirectMessageReactions'] })
import config from './config.json'
import commandhandler from './commandhandler'
import eventhandler from './eventhandler'

Discord.Collection.prototype.array = function () { return [...this.values()] }
/**
 * 
 * @param {Object} messageOptions 
 * @returns discord.CommandInteraction
 */
//@ts-ignore
Discord.CommandInteraction.prototype.safeReply = async function (messageOptions: Discord.InteractionReplyOptions) {
    if (this.replied) return await this.editReply(messageOptions)
    else return await this.reply(messageOptions)
}

/**
 * 
 * @param {Object} messageOptions 
 * @returns discord.CommandInteraction
 */

//@ts-ignore
Discord.ButtonInteraction.prototype.safeUpdate = async function (messageOptions: Discord.InteractionUpdateOptions) {
    if (this.replied) return await this.editReply(messageOptions)
    else return await this.update(messageOptions)
}

/**
 * 
 * @param {String|RegExp} searchValue 
 * @param {String} replaceValue 
 * @returns String
 */
String.prototype.replaceLast = function (searchValue: String, replaceValue: String) {
    return this.replace(new RegExp(searchValue + "([^" + searchValue + "]*)$"), replaceValue + "$1");
}

var date = new Date()
console.log(`Starte System am ${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`)

client.once('ready', async () => { //Status
    client.user.setStatus('idle')
    var start = Date.now()
    console.log(`[${client.user.username}]: Client geladen.`)
    console.log(`[${client.user.username}]: Monitoring wird aktiviert.`)
    require('./uptimemonitoring')(config.uptimeurl, client)
    console.log(`[${client.user.username}]: System wird gestartet.`)
    client.setMaxListeners(0)
    let mongoose = await require('./db/database')()
    console.log(`[${client.user.username}]: Verbindung zur Datenbank hergestellt.`)
    mongoose.connection.close()
    await commandhandler(client)
    await eventhandler(client)
    var end = Date.now()
    console.log(`[${client.user.username}]: System aktiv.`)
    console.log(`[${client.user.username}]: Startzeit betrug ${end - start} ms.`)

    client.battles = new Discord.Collection()
    require('./battledata/PvPBattle').setClient(client)
    client.user.setStatus('online')
})

client.login(config.token)