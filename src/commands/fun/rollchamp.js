const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('chinese')
        .setDescription('Get a chinese bot lane combo for League of Legends')
        .setDMPermission(false),
    async execute(interaction){
      await interaction.deferReply()
      let data = undefined
        const apiURL = "https://ddragon.leagueoflegends.com/cdn/13.15.1/data/en_US/champion.json";
          
        try {
          const response = await fetch(apiURL);
          if (!response.ok) {
            throw new Error(`Error fetching data from API: ${response.statusText}`);
          }
          data = await response.json();
        } catch (error) {
          console.error(`An error occurred: ${error}`);
        }
        if (data) {
          const filterTag = "Mage"||"Tank"||"Marksmen"; // Change this to the desired tag
          const championNames = Object.values(data.data)
              .filter((championInfo) => championInfo.tags.includes(filterTag))
              .map((championInfo) => championInfo.name)
          const randomChampions = []
          while(randomChampions.length < 2 && championNames.length > 0){
            const randomIndex = Math.floor(Math.random() * championNames.length);
            const randomChampion = championNames[randomIndex];
            randomChampions.push(randomChampion);
            championNames.splice(randomIndex, 1);
          }
          console.log(`Random ${filterTag} Champion Names:`, randomChampions);
          const replyString = `Random ${filterTag} Champion Names: ` + randomChampions
          await interaction.editReply(`${replyString}`)
        
        }
          
    }
}