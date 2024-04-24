const {
	SlashCommandBuilder,
	ChannelType,
	PermissionFlagsBits,
	Client,
	ChatInputCommandInteraction,
	EmbedBuilder,
} = require("discord.js");
const ms = require("ms");
const Setup = require("../../schemas/levelSetup");
const User = require("../../schemas/levels");
const mConfig = require("../../messageConfig.json");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("levelsystem")
		.setDescription("Setup the level system for your server.")
		.addSubcommandGroup((sg) =>
			sg
				.setName("notificationchannel")
				.setDescription("Setup the notification channel for the level system.")
				.addSubcommand((sub) =>
					sub
						.setName("configure")
						.setDescription("Configure the notification channel.")
						.addChannelOption((opt) =>
							opt
								.setName("channel")
								.addChannelTypes(ChannelType.GuildText)
								.setDescription("The channel to send the notification to.")
								.setRequired(true),
						),
				)
				.addSubcommand((sub) =>
					sub
						.setName("remove")
						.setDescription("Remove the notification channel."),
				),
		)
		.addSubcommandGroup((sg) =>
			sg
				.setName("reset")
				.setDescription(
					"Reset the level system of reset someone in the server.",
				)
				.addSubcommand((sub) =>
					sub
						.setName("server")
						.setDescription("Reset the level system for the server."),
				)
				.addSubcommand((sub) =>
					sub
						.setName("user")
						.setDescription("Reset someone in the server.")
						.addUserOption((opt) =>
							opt
								.setName("user")
								.setDescription("The user to reset.")
								.setRequired(true),
						),
				),
		)
		.addSubcommand((sub) =>
			sub
				.setName("boost")
				.setDescription("Give the server an xp boost.")
				.addNumberOption((opt) =>
					opt
						.setName("multiplier")
						.setDescription("Sets the multiplier of the boost.")
						.setRequired(true),
				)
				.addStringOption((opt) =>
					opt
						.setName("duration")
						.setDescription("Sets the duration of the boost.")
						.addChoices(
							{ name: "1 minute", value: "60" },
							{ name: "5 minutes", value: "300" },
							{ name: "10 minutes", value: "600" },
							{ name: "30 minutes", value: "1800" },
							{ name: "1 hour", value: "3600" },
						)
						.setRequired(true),
				),
		)
		.toJSON(),
	userPermissions: [PermissionFlagsBits.Administrator],
	botPermissions: [],
	/**
	 *
	 * @param {Client} client
	 * @param {ChatInputCommandInteraction} interaction
	 */
	run: async (client, interaction) => {
		const { options, guildId: GuildID, channel } = interaction;

		const subgrp = options.getSubcommandGroup();
		const subcmd = options.getSubcommand();

		switch (subgrp) {
			case "notificationchannel":
				data = await Setup.findOne({ GuildID });
				switch (subcmd) {
					case "configure": {
						const notificationChannel = options.getChannel("channel");

						if (!data) {
							await Setup.create({
								GuildID,
								Boost: 0,
								Channel: notificationChannel.id,
								Enabled: true,
							}).catch((err) => console.log(err));
							return interaction.reply({
								content: `Successfully set the notification channel to ${notificationChannel}`,
								ephemeral: true,
							});
						}
						data.Channel = notificationChannel.id;
						await data.save();
						return interaction.reply({
							content: `Successfully updated the notification channel to ${notificationChannel}`,
							ephemeral: true,
						});
					}

					case "remove":
						if (!data) {
							return interaction.reply({
								content: "There is no notification channel set.",
								ephemeral: true,
							});
						}
						Setup.deleteMany({ GuildID }).catch((err) => console.log(err));
						return interaction.reply({
							content: "Successfully removed all data.",
							ephemeral: true,
						});
				}
				break;
			case "reset":
				switch (subcmd) {
					case "user": {
						const user = options.getUser("user");
						data = await User.findOne({ GuildID, UserID: user.id });

						if (!data) {
							return interaction.reply({
								content: "That user is not in the database.",
								ephemeral: true,
							});
						}
						User.deleteMany({ GuildID, UserID: user.id }).catch((err) =>
							console.log(err),
						);
						return interaction.reply({
							content: `Successfully reset ${user}`,
							ephemeral: true,
						});
					}

					case "server":
						data = await user.find({ GuildID });
						if (!data) {
							return interaction.reply({
								content: "There is no data to reset.",
								ephemeral: true,
							});
						}
						User.deleteMany({ GuildID }).catch((err) => console.log(err));
						return interaction.reply({
							content: "Successfully reset all data.",
							ephemeral: true,
						});
				}
				break;
			default: {
				const duration = options.getString("duration");
				const boost = options.getNumber("multiplier");

				data = await Setup.findOne({ GuildID });

				if (!data) {
					await Setup.create({ GuildID, Boost: boost, Channel: "" }).catch(
						(err) => console.log(err),
					);

					const embed = new EmbedBuilder()
						.setTitle("XP Boost Activiated!")
						.setDescription(
							`I have set the XP boost to ${boost}x for \`${ms(
								duration * 1000,
							)}\``,
						)
						.setColor(mConfig.embedColorWarning)
						.setTimestamp();
					interaction.reply({ embeds: [embed] });

					setTimeout(async () => {
						await Setup.findOneAndUpdate({ GuildID }, { Boost: 0 });
						const embed = new EmbedBuilder()
							.setTitle("XP Boost Ended!")
							.setDescription("The XP boost has ended.")
							.setColor(mConfig.embedColorWarning)
							.setTimestamp();
						channel.send({ embeds: [embed] });
					}, duration * 1000);
				} else if (data) {
					if (data.Boost > 0) {
						return interaction.reply({
							content: "There is already an active boost.",
							ephemeral: true,
						});
					}
					data.Boost = boost;
					await data.save();

					const embed = new EmbedBuilder()
						.setTitle("XP Boost Activiated!")
						.setDescription(
							`I have set the XP boost to ${boost}x for \`${ms(
								duration * 1000,
							)}\``,
						)
						.setColor(mConfig.embedColorWarning)
						.setTimestamp();
					interaction.reply({ embeds: [embed] });

					setTimeout(async () => {
						await Setup.findOneAndUpdate({ GuildID }, { Boost: 0 });
						const embed = new EmbedBuilder()
							.setTitle("XP Boost Ended!")
							.setDescription("The XP boost has ended.")
							.setColor(mConfig.embedColorWarning)
							.setTimestamp();
						channel.send({ embeds: [embed] });
					}, duration * 1000);
				}
			}
		}
	},
};
