const discord = require('discord.js')

module.exports = async (ita, args, client) => {
    const { user, guild, color } = ita
    if(!user.data.battle?.ready) {

        //Willkommen
        let embed = new discord.MessageEmbed()
            .setColor(color.normal)
            .setTitle('Willkommen')
            .setDescription('>>> Herzlich Willkommen zum KeksBot Kampfsystem. (Wir suchen btw noch einen kuhlen Namen <:Ehehehe:694899997166010509>)\nBevor du anfangen kannst, Leute zu bonken, musst du aber noch ein paar Sachen machen.')
            .setFooter({text: 'Schritt 1/6'})
        let buttons = new discord.MessageActionRow()
            .addComponents(
                new discord.MessageButton()
                    .setCustomId('battlesetup:step1')
                    .setLabel('Fortfahren')
                    .setStyle('PRIMARY')
            )
        const message = await ita.reply({ embeds: [embed], components: [buttons], fetchReply: true, ephemeral: true })
        let interaction = await message.awaitMessageComponent({ time: 300000 }).catch(() => {})
        if(!interaction) return

        //Allgemein
        embed
            .setTitle('Allgemeine Informationen')
            .setDescription('>>> Beim KeksBot Kampfsystem (Wir suchen im Übrigen immer noch einen Namen) handelt es sich um ein skillbasiertes PvP "Roleplay".\nDurch Level-Ups erhöhen sich Statuswerte und man wird stärker. Relativ simpel :)\n**Wichtiger Hinweis**: Das ganze ist ein Proof of Concept und dient ausschließlich Entwicklungszwecken. Eine später verwendete Version kann stark vom aktuellen Entwicklungsstatus abweichen.')
            .setFooter({text: 'Schritt 2/6'})
        buttons = new discord.MessageActionRow()
            .addComponents(
                new discord.MessageButton()
                    .setCustomId('battlesetup:step2')
                    .setLabel('Fortfahren')
                    .setStyle('PRIMARY')
            )
        await interaction.update({ embeds: [embed], components: [buttons], fetchReply: true, ephemeral: true })
        interaction = await message.awaitMessageComponent({ time: 300000 }).catch(() => {})
        if(!interaction) return

        //Skill Priorität
        embed
            .setTitle('Skill Priorität')
            .setDescription('>>> Wähle einen priorisierten Skill.\nDieser steigt bei Level Ups schneller an, als andere.\n__Achtung__: Die hier getroffene Auswahl kann nur durch einen Reset geändert werden. Dabei geht der gesamte Fortschritt verloren.')
            .setFooter({text: 'Schritt 3/6'})
        buttons = new discord.MessageActionRow()
            .addComponents(
                new discord.MessageButton()
                    .setCustomId('battlesetup:step3.hp')
                    .setLabel('HP')
                    .setStyle('SECONDARY'),
                new discord.MessageButton()
                    .setCustomId('battlesetup:step3.atk')
                    .setLabel('Angriff')
                    .setStyle('SECONDARY'),
                new discord.MessageButton()
                    .setCustomId('battlesetup:step3.def')
                    .setLabel('Verteidigung')
                    .setStyle('SECONDARY'),
                new discord.MessageButton()
                    .setCustomId('battlesetup:step3.spd')
                    .setLabel('Geschwindigkeit')
                    .setStyle('SECONDARY'),
                new discord.MessageButton()
                    .setCustomId('battlesetup:step3.all')
                    .setLabel('Ausgeglichen')
                    .setStyle('SECONDARY'),
            )
        await interaction.update({ embeds: [embed], components: [buttons], fetchReply: true, ephemeral: true })
        interaction = await message.awaitMessageComponent({ time: 300000 }).catch(() => {})
        if(!interaction) return

        //Skills initialisieren
        let priority = require('../../battledata/skillids.json')[interaction.customId.split('.')[1]] || 'Ausgeglichen'
        let skillinformation = require('../../battledata/skills.json')
        let skills = []
        for (const s in skillinformation) {
            if (Object.hasOwnProperty.call(skillinformation, s)) {
                const skill = skillinformation[s];
                skills.push({
                    name: s,
                    value: skill.baseValue,
                    added: 0
                })
            }
        }
        if((user.data.level || 0) > 1) {

            //Autoskill
            embed
                .setTitle('Verteilung der Statuswerte')
                .setDescription(`> Du erhältst nun automatisch anhand deines Levels Skillpoints.`)
                .addField('Statuswerte', skills.map(skill => `**${skill.name}**: ${skill.value}`).join('\n'), true)
                .setFooter({text: 'Schritt 4/6'})
            await interaction.update({ embeds: [embed], components: [], fetchReply: true, ephemeral: true })
            for (let l = user.data.level || 0; l > 1; l--) {
                skills.forEach((skill) => {
                    let added = ((skillinformation[skill.name].avgChange - skillinformation[skill.name].diffChange) + Math.random() * skillinformation[skill.name].diffChange * 2)
                    added *= 
                        priority === skill.name ? 1.5 : 
                        priority === 'Ausgeglichen' ? 1.125 : 1
                    added = Math.round(added)
                    skill.added += added
                })
            }
            await require('delay')(2000)
            embed.addField('​', skills.map(s => `+ ${s.added}`.replaceAll(/\+ 0$/g, '')).join('\n'), true)
            embed.setFields([
                {
                    name: 'Statuswerte',
                    value: skills.map(skill => `**${skill.name}**: ${skill.value + skill.added}`).join('\n'),
                    inline: true
                },
                embed.fields[1]
            ])
            buttons = new discord.MessageActionRow()
                .addComponents(
                    new discord.MessageButton()
                        .setCustomId('battlesetup:step4')
                        .setLabel('Fortfahren')
                        .setStyle('PRIMARY')
                )
            skills.forEach(skill => {
                skill.value += skill.added
                skill.added = 0
            })
            await interaction.editReply({ embeds: [embed], components: [buttons] })
            interaction = await message.awaitMessageComponent({ time: 300000 }).catch(() => {})
            if(!interaction) return

            //Skillpunkte setzen
            buttons = new discord.MessageActionRow()
                .addComponents(
                    new discord.MessageButton()
                        .setCustomId('battlesetup:step5.hp')
                        .setLabel('HP')
                        .setStyle('SECONDARY'),
                    new discord.MessageButton()
                        .setCustomId('battlesetup:step5.atk')
                        .setLabel('Angriff')
                        .setStyle('SECONDARY'),
                    new discord.MessageButton()
                        .setCustomId('battlesetup:step5.def')
                        .setLabel('Verteidigung')
                        .setStyle('SECONDARY'),
                    new discord.MessageButton()
                        .setCustomId('battlesetup:step5.spd')
                        .setLabel('Geschwindigkeit')
                        .setStyle('SECONDARY')
                )
            embed.setFooter({text: 'Schritt 5/6'})
            for (let l = user.data.level || 0; l > 1; l--) {
                embed  
                    .setTitle('Verteilung der Statuswerte')
                    .setDescription(`>>> Pro Level kannst du eine zusätzliche Erhöhung eines beliebigen Skills durchführen. (${(l - 1)} verbleibend)`)
                    .setFields([
                        {
                            name: 'Statuswerte',
                            value: skills.map(skill => `**${skill.name}**: ${skill.value}`).join('\n'),
                            inline: true
                        },
                        {
                            name: '​', 
                            value: skills.map(s => `+ ${s.added}`.replaceAll(/\+ 0$/g, '​')).join('\n') + '​',
                            inline: true
                        }
                    ])
                await interaction.update({ embeds: [embed], components: [buttons] })
                interaction = await message.awaitMessageComponent({ time: 300000 }).catch(() => {})
                if(!interaction) return

                let sk = require('../../battledata/skillids.json')[interaction.customId.split('.')[1]]
                skills.forEach((skill) => {
                    if(skill.name != sk) return skill.added = 0
                    let added = ((skillinformation[skill.name].avgChange - skillinformation[skill.name].diffChange) + Math.random() * skillinformation[skill.name].diffChange * 2)
                    added *= 
                        priority === skill.name ? 1.5 : 
                        priority === 'Ausgeglichen' ? 1.125 : 1
                    added = Math.round(added / 2)
                    skill.added = added
                    skill.value += skill.added
                })
            }

            embed  
                .setTitle('Verteilung der Statuswerte')
                .setDescription(`>>> Alle verfügbaren Erhöhungen wurden verwendet.`)
                .setFields([
                    {
                        name: 'Statuswerte',
                        value: skills.map(skill => `**${skill.name}**: ${skill.value}`).join('\n'),
                        inline: true
                    },
                    {
                        name: '​', 
                        value: skills.map(s => `+ ${s.added}`.replaceAll(/\+ 0$/g, '​')).join('\n') + '​',
                        inline: true
                    }
                ])
            skills.forEach(skill => {
                skill.added = 0
            })
            buttons = new discord.MessageActionRow()
                .addComponents(
                    new discord.MessageButton()
                        .setCustomId('battlesetup:step5')
                        .setLabel('Fortfahren')
                        .setStyle('PRIMARY')
                )
            await interaction.update({ embeds: [embed], components: [buttons] })
            interaction = await message.awaitMessageComponent({ time: 300000 }).catch(() => {})
            if(!interaction) return
        } else {
            //Kein-Level-Fehler
            embed = new discord.MessageEmbed()
                .setTitle('Verteilung der Statuswerte')
                .setDescription(`>>> Du hast bisher noch kein Level erreicht.\nVerwende \`/cookies\` und \`/eat\`, um dein Level zu erhöhen und deine Statuswerte zu verbessern.`)
                .setFooter({text: 'Schritt 4+5/6'})
                .setColor(color.red)
            buttons = new discord.MessageActionRow()
                .addComponents(
                    new discord.MessageButton()
                        .setCustomId('battlesetup:step45')
                        .setLabel('Fortfahren')
                        .setStyle('PRIMARY')
                )
            await interaction.update({ embeds: [embed], components: [buttons] })
            interaction = await message.awaitMessageComponent({ time: 300000 }).catch(() => {})
            if(!interaction) return    
        }

        //Anzeige
        embed
            .setTitle('Registrierung abschließen')
            .setDescription('Bitte überprüfe die Werte und schließe die Vorbereitung ab.')
            .setFields([])
            .addField('Skill Priorität', priority, true)
            .addField('Statuswerte', skills.map(skill => `**${skill.name}**: ${skill.value}`).join('\n'), true)
            .setFooter({text: 'Schritt 6/6'})
        buttons = new discord.MessageActionRow()
            .addComponents(
                new discord.MessageButton()
                    .setCustomId('battlesetup:saveandexit')
                    .setLabel('Speichern und verlassen')
                    .setStyle('SUCCESS'),
                new discord.MessageButton()
                    .setCustomId('battlesetup:save')
                    .setLabel('Speichern und Fortfahren')
                    .setStyle('SUCCESS'),
                new discord.MessageButton()
                    .setCustomId('battlesetup:exit')
                    .setLabel('Abbrechen')
                    .setStyle('DANGER')
            )
        await interaction.update({ embeds: [embed], components: [buttons] })
        interaction = await message.awaitMessageComponent({ time: 300000 }).catch(() => {})
        if(!interaction) return
        if(interaction.customId.split(':')[1].startsWith('save')) {
            let battle = {
                priority,
                skills,
                ready: true,
                currentHP: skills.find(skill => skill.name == 'HP').value
            }
            await user.setData({ battle })
        }
        switch(interaction.customId.split(':')[1]) {
            case 'saveandexit':
                embed
                    .setTitle('Daten gespeichert')
                    .setDescription('Alle erforderlichen Daten wurden angelegt.')
                    .setFooter({text: ''})
                    .setFields([])
                    .setColor(color.lime)
                await interaction.update({ embeds: [embed], components: [] })
                return false
            case 'save':
                embed
                    .setTitle('Daten gespeichert')
                    .setDescription('Alle erforderlichen Daten wurden angelegt. Der Prozess wird nun fortgesetzt.')
                    .setFooter({text: ''})
                    .setFields([])
                    .setColor(color.lime)
                await interaction.update({ embeds: [embed], components: [] })
                await require('delay')(3000)
                return true
            case 'exit':
                embed
                    .setTitle('Abbruch')
                    .setDescription('Der Prozess wurde abgebrochen.')
                    .setFooter({text: 'Alle angelegten Daten wurden vernichtet.'})
                    .setFields([])
                    .setColor(color.red)
                await interaction.update({ embeds: [embed], components: [] })
                return false
        }
    }
}