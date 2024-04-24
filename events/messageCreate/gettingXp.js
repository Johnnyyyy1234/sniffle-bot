const { EmbedBuilder, Client, Message } = require("discord.js");
const User = require("../../schemas/levels");
const Setup = require("../../schemas/levelSetup");
const mConfig = require("../../messageConfig.json");
const errorHandler = require("../../utils/errorHandler");

const cooldown = new Set();

module.exports =
	/**
	 *
	 * @param {Client} client
	 * @param {Message} message
	 */
	async (client, message) => {
		const { guild, guildId: GuildID, author } = message;
		const UserID = author.id;
		if (author.bot || !guild) return;
		if (cooldown.has(UserID)) return;
		if (!message.content) return;

		try {
			const channelDB = await getChannelDB(GuildID);
			if (!channelDB?.Enabled) return;

			const notificationChannel = await getNotificationChannel(
				client,
				channelDB,
				message.channel,
			);

			const xpAmount = calculateXpAmount(channelDB);
			const user = await getUserOrCreate(GuildID, UserID);
			const levelUpResult = updateUserXpAndLevel(user, xpAmount);

			if (levelUpResult.leveledUp) {
				const embed = createLevelUpEmbed(
					author,
					levelUpResult.newLevel,
					mConfig.embedColorSuccess,
				);
				await notificationChannel.send({ embeds: [embed] });
			}

			await user.save();
		} catch (error) {
			console.log(error);
		}

		cooldown.add(UserID);
		setTimeout(() => {
			cooldown.delete(UserID);
		}, 5_000);
	};

function getChannelDB(GuildID) {
	return Setup.findOne({ GuildID }).catch((err) => {
		console.log(err);
		return Setup.create({
			GuildID,
			Boost: 0,
			Channel: "",
			Enabled: false,
		});
	});
}

async function getNotificationChannel(client, channelDB, fallbackChannel) {
	if (channelDB?.Channel.length > 0) {
		return client.channels.fetch(channelDB.Channel).catch((err) => {
			console.log(err);
			return fallbackChannel;
		});
	}
	return fallbackChannel;
}

function calculateXpAmount(channelDB) {
	const min = 25;
	const max = 300;
	let xpAmount = Math.floor(Math.random() * (max - min + 1) + min);

	if (channelDB && channelDB.Boost !== 0) xpAmount *= channelDB.Boost;

	return xpAmount;
}

async function getUserOrCreate(GuildID, UserID) {
	let user = await User.findOne({ GuildID, UserID });
	if (!user) {
		user = await User.create({ GuildID, UserID });
	}
	return user;
}

function updateUserXpAndLevel(user, xpAmount) {
	user.Xp += xpAmount;

	const newLevel = Number.parseInt((1 + Math.sqrt(1 + (8 * user.Xp) / 300)) / 2);
	const oldLevel = user.Level;
	const leveledUp = oldLevel < newLevel;

	user.Level = newLevel;

	return { leveledUp, newLevel };
}

function createLevelUpEmbed(author, newLevel, embedColor) {
	return new EmbedBuilder()
		.setTitle("🎉 Congratulations 🎉")
		.setThumbnail(author.displayAvatarURL({ dynamic: true }))
		.addFields(
			{
				name: "User:",
				value: `${author.globalName}`,
				inline: true,
			},
			{ name: "New Level:", value: `${newLevel}`, inline: true },
			{
				name: "Check the global leaderboard using:",
				value: "</leaderboard:1207794239971262464>",
			},
		)
		.setColor(embedColor);
}
