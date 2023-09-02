const { SlashCommandBuilder } = require("discord.js");
const ytToken = process.env.YT_TOKEN;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ytsearch')
        .setDescription('Get the first result from a Youtube search')
        .addStringOption(options =>
            options.setName('search')
            .setDescription('Enter your search query')
            .setRequired(true)
            .setMaxLength(200))
        .setDMPermission(false),
    async execute(interaction){
        await interaction.deferReply()
        let results = undefined
        const query = interaction.options.getString('search')
        
        console.log(`${interaction.user.username} used /ytsearch for the term ${query} in the server ${interaction.guild.name}`)

        const apiURL = `https://www.googleapis.com/youtube/v3/search?key=${ytToken}&maxResults=4&q=${query}&part=snippet&type=video`
        try{
            const response = await fetch(apiURL)
            if (!response.ok) {
                throw new Error(`Error fetching data from API: ${response.statusText}`);
            }
            results = await response.json();
        }
        catch(e){
            console.error(e)
        }
        if(results){
            const queries = results.items[0].id.videoId
            await interaction.editReply(`Here's the first video from the results of searching "${query}": https://www.youtube.com/watch?v=${queries}`)
        }
        else{
            await interaction.editReply(`The search failed.`)
        }
    }
}