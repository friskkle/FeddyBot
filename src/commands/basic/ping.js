const {SlashCommandBuilder} = require("discord.js")
const wait = require('node:timers/promises').setTimeout

module.exports = { //module.exports is used to allow the data to be taken using require() from other files
    data: new SlashCommandBuilder()
            .setName("ping")
            .setDescription("replies your ping message."),
    async execute(interaction){
        await interaction.reply({content: `feddy! [this](https://www.youtube.com/watch?v=EB11UoE_AHU) is just for you :)`, ephemeral: true})
        await wait(10000)
        
        await interaction.editReply({content: `feddy!`, ephemeral: true})
        await wait(60000)
        await interaction.deleteReply()
    },
}