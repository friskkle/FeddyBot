const { EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require("@discordjs/builders");
const { SlashCommandBuilder, ButtonStyle, ComponentType, Embed } = require("discord.js");
const wait = require('node:timers/promises').setTimeout

module.exports = {
    data: new SlashCommandBuilder()
        .setName("roshambo")
        .setDescription("a best-of-five rock paper scissors game against one user")
        .addUserOption(option =>
            option.setName("opponent")
            .setDescription("the opposing user")
            .setRequired(true))
        .setDMPermission(false),
    async execute(interaction) {
        const user1 = interaction.user
        const user2 = interaction.options.getUser("opponent")
        console.log(`${user1.username} has challenged ${user2.username} in the ${interaction.guild.name} server`)
        const users = []
        users.push(user1)
        users.push(user2)

        const battleChannel = interaction.channel

        const score = [0, 0]

        // confirmation buttons and rock paper scissor buttons
        const confirm = new ButtonBuilder()
                            .setCustomId('confirm')
                            .setLabel('Confirm')
                            .setStyle(ButtonStyle.Success)

        const cancel = new ButtonBuilder()
                            .setCustomId('deny')
                            .setLabel('Deny')
                            .setStyle(ButtonStyle.Danger)

        const rock = new ButtonBuilder()
                            .setCustomId('rock')
                            .setLabel('🪨')
                            .setStyle(ButtonStyle.Secondary)

        const paper = new ButtonBuilder()
                            .setCustomId('paper')
                            .setLabel('📃')
                            .setStyle(ButtonStyle.Secondary)
        
        const scissors = new ButtonBuilder()
                            .setCustomId('scissors')
                            .setLabel('✂️')
                            .setStyle(ButtonStyle.Secondary)
        
        const confirmation = new ActionRowBuilder()
                            .addComponents(confirm, cancel)
        
        const choiceButtons = new ActionRowBuilder()
                            .addComponents(rock, paper, scissors)


        const battleConfirmation = await interaction.reply({content: `${user2}, ${user1} has challenged you to a game of rock paper scissors. The first to reach three wins will be the victor. Do you comply?`,
                             embeds: [], components: [confirmation]})
        const battleConfirmationFilter = i => i.user.id === user2.id
        try {
            const bConf = await battleConfirmation.awaitMessageComponent({filter: battleConfirmationFilter, time: 60_000})

            if(bConf.customId === "confirm"){
                const time = Date.now() + 6000
                await bConf.update({content: `Get ready, the legendary battle will begin <t:${Math.floor(time/1000)}:R>!`,
                                    components: []})
                await wait(5100);
                await bConf.editReply({content: `Get ready, the legendary battle will begin now!`,
                components: []})

                let currentRound = 1
                let missedRounds = 0
                while(true){
                    const round = new EmbedBuilder()
                                    .setColor(0x5865F2)
                                    .setTitle(`Rock Paper Scissors Round ${currentRound}`)
                                    .setDescription(`${user1} ${score[0]} vs ${score[1]} ${user2}`)
                                    .setTimestamp()
                                    .setImage('https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/c69806f6-adda-494b-8684-f0ba73c81693/d9dglyy-1cf30886-0272-41cc-bfe8-785c8a02d6e7.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcL2M2OTgwNmY2LWFkZGEtNDk0Yi04Njg0LWYwYmE3M2M4MTY5M1wvZDlkZ2x5eS0xY2YzMDg4Ni0wMjcyLTQxY2MtYmZlOC03ODVjOGEwMmQ2ZTcuanBnIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.r-Po5aylsfThYoK5JufxGzxIwOrCJsjOAHwFkIF1cps')
                    
                    const duel = await battleChannel.send({content:`You have about 30 seconds to pick 😉`,
                                        embeds: [round], components: [choiceButtons]})

                    const collector = duel.createMessageComponentCollector({componentType: ComponentType.Button, time: 30_000});
                    const chosen = [0, 0]

                    collector.on('collect', async i => {
                        let num = undefined
                        if (i.user === user1 && chosen[0] == 0) {
                            i.reply(`${user1} has picked`)
                            num = 0;
                        }
                        else if (i.user === user2 && chosen[1] == 0) {
                            i.reply(`${user2} has picked`)
                            num = 1;
                        }
                        else return;

                        const selection = i.customId
                        chosen[num] = selection
                    })

                    let i = 0
                    while(chosen.includes(0)){
                        if(!chosen.includes(0)) {
                            console.log('both sides have picked')
                            await wait(500)
                            break
                        }

                        await wait(1000)
                        if(++i === 30) {
                            console.log('roshambo timeout')
                            break
                        }
                    }

                    //choosing the winner of the round
                    if(!chosen[0] && !chosen[1]){
                        duel.reply({content: `No choices were picked, the match will be canceled.`})
                        break
                    }
                    else if(!chosen[0] || !chosen[1]){
                        const absentUser = users[chosen.indexOf(0)]
                        missedRounds++
                        if(missedRounds == 0) duel.reply(`${absentUser} did not pick, you get one more chance.`);
                        duel.reply(`${absentUser} did not pick, the match is canceled.`)
                        break
                    }
                    else if (chosen[0] === 'rock'){
                        if(chosen[1] === 'scissors'){
                            score[0]++
                            const roundResult = new EmbedBuilder()
                                                .setTitle(`${user1.username}🪨 vs ✂️${user2.username}`)
                            duel.reply({content: `${user1} has won the round!`, embeds: [roundResult]})
                        }
                        else if(chosen[1] === 'paper'){
                            score[1]++
                            const roundResult = new EmbedBuilder()
                                                .setTitle(`${user1.username}🪨 vs 📃${user2.username}`)
                            duel.reply({content: `${user2} has won the round!`, embeds: [roundResult]})
                        }
                        else{
                            const roundResult = new EmbedBuilder()
                                                .setTitle(`${user1.username}🪨 vs 🪨${user2.username}`)
                            duel.reply({content: `It's a draw! We will try that again...`, embeds: [roundResult]})
                        }
                    }
                    else if(chosen[0] === 'paper'){
                        if(chosen[1] === 'rock'){
                            score[0]++
                            const roundResult = new EmbedBuilder()
                                                .setTitle(`${user1.username}📃 vs 🪨${user2.username}`)
                            duel.reply({content: `${user1} has won the round!`, embeds: [roundResult]})
                        }
                        else if(chosen[1] === 'scissors'){
                            score[1]++
                            const roundResult = new EmbedBuilder()
                                                .setTitle(`${user1.username}📃 vs ✂️${user2.username}`)
                            duel.reply({content: `${user2} has won the round!`, embeds: [roundResult]})
                        }
                        else{
                            const roundResult = new EmbedBuilder()
                                                .setTitle(`${user1.username}📃 vs 📃${user2.username}`)
                            duel.reply({content: `It's a draw! We will try that again...`, embeds: [roundResult]})
                        }
                    }
                    else if(chosen[0] == 'scissors'){
                        if(chosen[1] === 'paper'){
                            score[0]++
                            const roundResult = new EmbedBuilder()
                                                .setTitle(`${user1.username}✂️ vs 📃${user2.username}`)
                            duel.reply({content: `${user1} ✂️ has won the round!`, embeds: [roundResult]})
                        }
                        else if(chosen[1] === 'rock'){
                            score[1]++
                            const roundResult = new EmbedBuilder()
                                                .setTitle(`${user1.username}✂️ vs 🪨${user2.username}`)
                            duel.reply({content: `${user2} has won the round!`, embeds: [roundResult]})
                        }
                        else{
                            const roundResult = new EmbedBuilder()
                                                .setTitle(`${user1.username}✂️ vs ✂️${user2.username}`)
                            duel.reply({content: `It's a draw! We will try that again...`, embeds: [roundResult]})
                        }
                    }
                    else{}

                    if (score.includes(3)) {
                        const champ = users[score.indexOf(3)]
                        console.log(`${champ.username} won the game`)
                        const winner = new EmbedBuilder()
                                    .setColor(0x5865F2)
                                    .setTitle(`${user1.username} ${score[0]} vs ${score[1]} ${user2.username}`)
                                    .setDescription(`${champ} has won!`)
                                    .setImage('https://thumbs.gfycat.com/BriefMassiveGosling-max-1mb.gif')
                        
                        await battleChannel.send({content: `The match has concluded!`, embeds: [winner]})
                        break
                    }
                    const nextTime = Date.now() + 6000
                    await battleChannel.send(`We will begin the next round shortly`)
                    await wait(5000);
                    currentRound++
                }
            }
            else if(bConf.customId === "deny"){
                await bConf.update({content: `${user2} has rejected the offer, the match has been canceled.`,
                                    embeds: [], components: []})
            }
        }
        catch(e){
            console.log(e)
            await interaction.editReply({content: `There was no response to the duel invitation 😔`,
                                        embeds: [], components: []})
        }
    }
}