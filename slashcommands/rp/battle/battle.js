const discord = require('discord.js')

module.exports = {
    name: 'battle',
    description: 'Woäk in pwogwess',
    permission: 'ADMINISTRATOR',
    options: [
        {
            name: 'user',
            description: 'Der herausgeforderte Nutzer',
            required: true, 
            type: 'USER'
        }
    ],
    before: require('../../../subcommands/before/battle'),
    execute: async function(client, message, args) {

    }
}