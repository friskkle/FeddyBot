const {SlashCommandBuilder} = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('info')
		.setDescription('Displays information about the server or the user')
        .addSubcommand(subcommand => 
            subcommand.setName("user")
            .setDescription("Information about the requesting user"))
        .addSubcommand(subcommand =>
            subcommand.setName("server")
            .setDescription("Information about the server"))
        .setDMPermission(false),
	async execute(interaction) {
		if (interaction.options.getSubcommand() === 'user') {
            // interaction.user is the object representing the User who ran the command
            // interaction.member is the GuildMember object, which represents the user in the specific guild
            await interaction.reply({content: `This command was run by ${interaction.user.username},
            who joined on ${interaction.member.joinedAt}.`, ephemeral: true})
            const message = await interaction.fetchReply();
            console.log(message.username);
        }
        else if (interaction.options.getSubcommand() === 'server') {
            // interaction.guild is the object representing the Guild in which the command was run
		    await interaction.reply(`This server is ${interaction.guild.name} and has ${interaction.guild.memberCount} members.`)
        }
	},
}