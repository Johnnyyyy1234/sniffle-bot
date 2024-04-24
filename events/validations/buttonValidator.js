require("colors");

const { EmbedBuilder } = require("discord.js");
const { developersId, testServerId } = require("../../config.json");
const mConfig = require("../../messageConfig.json");
const getButtons = require("../../utils/getButtons");

module.exports = async (client, interaction) => {
	if (!interaction.isButton()) return;
	const buttons = getButtons();

	try {
		let buttonObject = await Promise.all(
			buttons.map(async (btn) => {
				if (typeof btn.customId === "string") {
					return btn.customId === interaction.customId ? btn : null;
				}
				return null;
			}),
		).then((results) => results.find((result) => result !== null));

		if (
			!buttonObject &&
			buttons.some((btn) => typeof btn.customId === "function")
		) {
			const customIdResults = await Promise.all(
				buttons
					.filter((btn) => typeof btn.customId === "function")
					.map(async (btn) => {
						const customId = await btn.customId(interaction);
						return customId === interaction.customId ? btn : null;
					}),
			);
			buttonObject = customIdResults.find((result) => result !== null);
		}

		if (!buttonObject) return;

		if (buttonObject.devOnly) {
			if (!developersId.includes(interaction.member.id)) {
				const rEmbed = new EmbedBuilder()
					.setColor(`${mConfig.embedColorError}`)
					.setDescription(`${mConfig.commandDevOnly}`);
				interaction.reply({ embeds: [rEmbed], ephemeral: true });
				return;
			}
		}

		if (buttonObject.testMode) {
			if (interaction.guild.id !== testServerId) {
				const rEmbed = new EmbedBuilder()
					.setColor(`${mConfig.embedColorError}`)
					.setDescription(`${mConfig.commandTestMode}`);
				interaction.reply({ embeds: [rEmbed], ephemeral: true });
				return;
			}
		}

		if (buttonObject.userPermissions?.length) {
			for (const permission of buttonObject.userPermissions) {
				if (interaction.member.permissions.has(permission)) {
					continue;
				}
				const rEmbed = new EmbedBuilder()
					.setColor(`${mConfig.embedColorError}`)
					.setDescription(`${mConfig.userNoPermissions}`);
				interaction.reply({ embeds: [rEmbed], ephemeral: true });
				return;
			}
		}

		if (buttonObject.botPermissions?.length) {
			for (const permission of buttonObject.botPermissions) {
				const bot = interaction.guild.members.me;
				if (bot.permissions.has(permission)) {
					continue;
				}
				const rEmbed = new EmbedBuilder()
					.setColor(`${mConfig.embedColorError}`)
					.setDescription(`${mConfig.botNoPermissions}`);
				interaction.reply({ embeds: [rEmbed], ephemeral: true });
				return;
			}
		}

		if (interaction.message.interaction) {
			if (interaction.message.interaction.user.id !== interaction.user.id) {
				const rEmbed = new EmbedBuilder()
					.setColor(`${mConfig.embedColorError}`)
					.setDescription(`${mConfig.cannotUseButton}`);
				interaction.reply({ embeds: [rEmbed], ephemeral: true });
				return;
			}
		}

		await buttonObject.run(client, interaction);
	} catch (err) {
		console.log(`An error occurred! 1 ${err}`.red);
	}
};
