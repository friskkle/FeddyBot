const { SlashCommandBuilder, PermissionsBitField, PermissionFlagsBits } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
            .setName('unmute')
            .setDescription('Mute a member')
            .addUserOption(option =>
                option.setName('user')
                .setDescription('User to mute')
                .setRequired(true))
            .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
            .setDMPermission(false),
    async execute(interaction){
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)){
            await interaction.reply({content: `You don't have the permission to unmute members.`, ephemeral: true})
        }

        await interaction.deferReply()

        const muteUser = interaction.options.getUser('user')
        const mutedMember = await interaction.guild.members.fetch(muteUser.id)

        mutedMember.timeout(null).catch(async e => {return await interaction.editReply({content: `Could not unmute this user`, ephemeral: true})})

        await interaction.editReply({content: `${muteUser} has been unmuted`})
    }
}