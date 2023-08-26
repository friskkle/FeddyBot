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
            .setMaxLength(200)),
    async execute(interaction){
        await interaction.deferReply()
        const results = undefined
        const query = interaction.options.getString('search')

        const apiURL = `https://www.googleapis.com/youtube/v3/search?key=${ytToken}&maxResults=1&q=${query}&part=snippet&type=video`
        console.log(apiURL)
        try{
            const response = await fetch(apiURL)
            if (!response.ok) {
                throw new Error(`Error fetching data from API: ${response.statusText}`);
            }
            results = await response.json()
        }
        catch(e){
            console.error(e)
        }
        if(results){
            const queries = results.data.items[0].id.videoId
            await interaction.editReply(`Here's the first video from the search: https://www.youtube.com/watch?v=${videoId}`)
        }
        else{
            await interaction.editReply(`The search failed.`)
        }
    }
}