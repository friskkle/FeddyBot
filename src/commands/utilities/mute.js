const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
            .setName('mute')
            .setDescription('Mute a member')
            .addUserOption(option =>
                option.setName('user')
                .setDescription('User to mute')
                .setRequired(true))
            .addIntegerOption(option =>
                option.setName('time')
                .setDescription('How many minutes to mute')
                .setMinValue(1)
                .setRequired(true))
            .addStringOption(option =>
                option.setName('reason')
                .setDescription('The reason for the timeout'))
            .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
            .setDMPermission(false),
    async execute(interaction){
        console.log(`${interaction.user.username} is attempting to use mute`)
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)){
            interaction.reply({content: `You don't have the permission to mute members.`, ephemeral: true})
        }

        await interaction.deferReply()

        let time = interaction.options.getInteger("time") * 60000
        const muteUser = interaction.options.getUser('user')
        const muteMember = await interaction.guild.members.fetch(muteUser.id)
        const reason = interaction.options.getString('reason') ?? 'Not provided'

        if(muteMember.user.bot){
            await interaction.editReply('I cannot mute a bot')
            return;
        }
        console.log(`${muteMember} is getting muted in ${interaction.guild.name}`)

        const muteEmbed = new EmbedBuilder()
            .setColor('Blue')
            .setTitle('Muted user')
            .setFields({name: 'User', value: `${muteUser.username}`, inline: true})
            .addFields({name: 'Reason', value: `${reason}`, inline: true})
            .addFields({name: 'Duration', value: `${interaction.options.getInteger('time')} minutes`, inline: true})

        await muteMember.timeout(time).catch(async e => {
            console.log(e)
            await interaction.editReply({content: `Could not mute this user`, ephemeral: true})
            return
        })
            
        await interaction.editReply({content: `${muteUser} has been muted`, embeds: [muteEmbed]})
    }
}