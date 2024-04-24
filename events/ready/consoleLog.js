require("colors");
const mongoose = require("mongoose");
const mongoURL = process.env.MONGO_URL;

module.exports = async (client) => {
	console.log(`[INFO] Logged in as ${client.user.username}`.blue);
	client.user.setStatus("invisible");
	
	client.guilds.cache.forEach((guild) => {
		console.log(`${guild.name} | ${guild.id}`);
	});

	if (!mongoURL) return;
	mongoose.set("strictQuery", true);

	if (await mongoose.connect(mongoURL)) {
		console.log("[INFO] Connected to the database".green);
	}
};
