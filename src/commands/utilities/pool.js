const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder } = require("discord.js");
const poolSchema = require('../../schema/poolSchema');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pool')
        .setDescription('Store anything into a pool of ideas, and take them at random')
        .addSubcommand(subcommand =>
            subcommand.setName('store')
            .setDescription('Store a term in the pool')
            .addStringOption(option =>
                option.setName('term')
                .setDescription('The term to store')
                .setRequired(true))
            .addStringOption(option =>
                option.setName('category')
                .setDescription('Enter a word to categorize ')))
        .addSubcommand(subcommand =>
            subcommand.setName('pull')
            .setDescription('Pull a random idea')
            .addStringOption(option =>
                option.setName('category')
                .setDescription('The category to pull from')))
        .setDMPermission(false),
    async execute(interaction){
        if (interaction.options.getSubcommand() === 'store'){
            const term = interaction.options.getString('term')
            const category = interaction.options.getString('category') ?? 'All'
            const creator = interaction.user.id

            const confirm = new ButtonBuilder()
                                .setCustomId('confirm')
                                .setLabel('Confirm')
                                .setStyle(ButtonStyle.Primary)

            const cancel = new ButtonBuilder()
                                .setCustomId('cancel')
                                .setLabel('Cancel')
                                .setStyle(ButtonStyle.Secondary)
            
            const confirmation = new ActionRowBuilder()
                                .addComponents(confirm, cancel)

            const info = new EmbedBuilder()
                                .setColor(0x5865F2)
                                .setTitle(`Term: ${term}\nCategory: ${category}`)

            const henji = await interaction.reply({content: `You want to add this in the pool of knowledge?`, embeds: [info], components: [confirmation]})

            const collectorFilter = i => i.user.id === interaction.user.id

            try{
                const conf = await henji.awaitMessageComponent({filter: collectorFilter, time: 60_000})
                if(conf.customId === 'confirm'){
                    await conf.update({content: `Saving...!`, embeds: [info], components: []})
                    poolSchema.create({
                        Term: term,
                        Category: category,
                        Owner: creator
                    })
                    await conf.editReply({content: `Information saved to the database!`, embeds: [info], components: []})
                }
                else{
                    await conf.update({content: `Canceled saving to the pool`, embeds: [], components: []})
                }
            }
            catch(e){
                interaction.editReply({content:`Something went wrong :(`, embeds: [], components: []})
                console.log(e)
            }
        }
        else if (interaction.options.getSubcommand() === 'pull'){
            await interaction.deferReply()
            const category = interaction.options.getString('category') ?? undefined
            if(category){
                await interaction.editReply({content: `Fetching a term from the category ${category}...`})

                try{
                    const term = await poolSchema.findOne({Category: `${category}`})
                    await interaction.editReply({content: `Your term is: ${term.Term}`})
                }
                catch(e){
                    console.log(e)
                    await interaction.editReply({content: `Sorry, the category could not be found`})
                }
            }
            else{
                await interaction.editReply({content: `Fetching a term...`})
                const term = await poolSchema.findOne()
                await interaction.editReply({content: `Your term is: ${term.Term}`})
            }
        }
    }
}