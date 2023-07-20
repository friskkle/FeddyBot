const { Events } = require('discord.js');
const mongoose = require("mongoose");
const mongoDBURL = process.env.MONGODBURL;

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);

		if (!mongoDBURL) return;

		await mongoose.connect(mongoDBURL || '', {
			keepAlive: true,
			useNewUrlParser: true,
			useUnifiedTopology: true,
		})

		if (mongoose.connect) {
			console.log('The database is running!')
		}
	},
};