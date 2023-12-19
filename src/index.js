const dotenv = require('dotenv')
const fs = require('node:fs')
const path = require('node:path')
const {Client, Collection, GatewayIntentBits, EmbedBuilder} = require('discord.js')
const {token} = require('../config.json')
const remindSchema = require('./schema/remindSchema')

dotenv.config();

const client = new Client({intents: [
	GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildMembers,
	GatewayIntentBits.GuildMessages,
	GatewayIntentBits.GuildMessageReactions
	]})
// the Guilds object caches the servers(guilds), channels, and roles

// Have the client store a collection of the commands for interactive use
client.commands = new Collection()
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

const eventsPath = path.join(__dirname, 'events')
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'))

for (const file of eventFiles){
	const filePath = path.join(eventsPath, file)
	const event = require(filePath)
	if(event.once){
		client.once(event.name, (...args) => event.execute(...args))
	}
	else{
		client.on(event.name, (...args) => event.execute(...args))
	}
}

// The timer to check for any reminders
setInterval(async () => {
	const reminders = await remindSchema.find();
	if(!reminders) return;
	else{
		reminders.forEach(async reminder => {
			if (reminder.Time > Date.now()) return;
			const user = await client.users.fetch(reminder.User);
			const dm = reminder.DM
			const channelId = reminder.Channel
			const embed = new EmbedBuilder()
                                .setColor('Blurple')
                                .setDescription(`📝 Confirm the following information about your reminder:\nTitle: ${reminder.Title}\nDescription: ${reminder.Desc ?? 'none'}`)

			if(dm == true){
					client.users.send(user, {
					content: `Hey ${user}, I'm here to remind you about ${reminder.Title}.`,
					embeds: [embed]
				})
			}
			else{
				const sendChannel = client.channels.cache.get(channelId)
				await sendChannel.send({content: `Hey ${user}, I'm here to remind you about ${reminder.Title}.`, embeds: [embed]})
			}

			await remindSchema.deleteMany({
				User: user.id,
				Time: reminder.Time,
				Title: reminder.Title,
				Desc: reminder.Desc
			});
		})
	}
}, 1000 * 5)

client.login(token)