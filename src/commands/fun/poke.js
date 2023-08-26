const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("poke")
        .setDescription("Poke another user.")
        .addUserOption( option => 
            option.setName("user")
            .setDescription("The user to poke")
            .setRequired(true))
        .setDMPermission(false),
    async execute(interaction){
        const source = interaction.user
        const target = interaction.options.getUser("user")

        await interaction.reply(`${source} has tickled ${target}'s willies`)
    }
}