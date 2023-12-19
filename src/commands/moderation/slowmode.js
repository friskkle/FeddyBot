const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slow')
        .setDescription('Activates slow mode in the current channel')
        .addIntegerOption(option =>
            option.setName('interval')
            .setDescription('How many seconds each user needs to wait before sending another message')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(21600))
        .addIntegerOption(option =>
            option.setName('time')
            .setDescription('How many minutes to slow down the channel')
            .setMaxValue(3600)
            .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ManageChannels)
        .setDMPermission(false),
        async execute(interaction){
            const duration = interaction.options.getInteger('time')
            const curChannel = interaction.channel

            console.log(`${interaction.user.username} is slowing down the channel ${curChannel.name} of the server ${interaction.guild.name}`)
            await interaction.reply(`This channel is slowing down for the next ${duration} minute/s.`)

            await curChannel.setRateLimitPerUser(5)

            setTimeout(async ()=>{
                await curChannel.setRateLimitPerUser(0)
            }, 60000*duration)
            console.log('done')
        }
}