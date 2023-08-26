const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder, ChannelSelectMenuBuilder } = require("discord.js");
const remindSchema = require("../../schema/remindSchema");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("remindme")
        .setDescription("Set a reminder for a certain time")
        .addBooleanOption(option =>
            option.setName("dm")
            .setDescription("Remind in DMs instead of a channel?")
            .setRequired(true))
        .addIntegerOption(option =>
            option.setName("time")
            .setDescription("Set how many minutes from now to be reminded")
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(2400))
        .addStringOption(option =>
            option.setName("title")
            .setDescription("The occasion of the reminder")
            .setRequired(true)
            .setMaxLength(20))
        .addStringOption(option =>
            option.setName("description")
            .setDescription("Details of the reminder")
            .setMaxLength(100))
        .setDMPermission(false),
        async execute(interaction){
            // set the time and information of the reminder
            let time = Date.now() + interaction.options.getInteger("time") * 1000 * 60
            const title = interaction.options.getString("title")
            const description = interaction.options.getString("description")
            const uid = interaction.user.id

            // confirmation buttons
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
            
            const embed = new EmbedBuilder()
                                .setColor('Blurple')
                                .setDescription(`📝 Confirm the following information about your reminder:\nTitle: ${title}\nDescription: ${description ?? 'none'}`)
                                
            const response = await interaction.reply({content: `This reminder is planned <t:${Math.floor(time/1000)}:R> from now`, embeds: [embed], components: [confirmation]})

            //if the user prompts to get reminded in a channel, this is the channel selector
            const channelPicker = new ChannelSelectMenuBuilder()
                                .setCustomId('channelpicker')
                                .setPlaceholder('Choose a channel to be reminded in')
                                .setMaxValues(1)

            const picker = new ActionRowBuilder()
                                .addComponents(channelPicker)

            const collectorFilter = i => i.user.id === interaction.user.id

            try {
                const cnf = await response.awaitMessageComponent({filter: collectorFilter, time: 60_000})

                if (cnf.customId === 'confirm') {
                    if (!interaction.options.getBoolean("dm")){
                        const chn = await cnf.update({content: "Please choose a channel to be reminded in.", embeds: [], components: [picker]});
                    }
                    await cnf.update({content: "Reminder set!", embeds: [], components: []})

                    await remindSchema.create({
                        User: uid,
                        Time: time,
                        Title: title,
                        Desc: description ?? 'none'
                    })

                }
                else if (cnf.customId === 'cancel') {
                    await cnf.update({content: "Reminder canceled!", embeds: [], components: []})
                }
            }
            catch (e) {
                await interaction.editReply({content: "No response, reminder canceled!", embeds: [], components: []})
            }
        }
}