const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unslow')
        .setDescription('Removes slow mode in the current channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ManageChannels)
        .setDMPermission(false),
        async execute(interaction){
            const curChannel = interaction.channel
            console.log(`${interaction.user.username} is unslowing the channel ${curChannel.name} of the server ${interaction.guild.name}`)
            await interaction.reply({content: `Slow mode removed!`, ephemeral: true})

            await curChannel.setRateLimitPerUser(0)
        }
}