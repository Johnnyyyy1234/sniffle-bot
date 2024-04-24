const {
	SlashCommandBuilder,
	EmbedBuilder,
	CommandInteraction,
	Client,
} = require("discord.js");
const fs = require("fs");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("kiss")
		.setDescription("Give a user a kiss")
		.addBooleanOption((o) =>
			o
				.setName("send-dm")
				.setDescription("Send the embed to the targets dms")
				.setRequired(true),
		)
		.addUserOption((o) =>
			o
				.setName("user")
				.setDescription("Please specify a user")
				.setRequired(true),
		)
		.toJSON(),
	/**
	 *
	 * @param {CommandInteraction} interaction
	 * @param {Client} client
	 */

	run: async (client, interaction) => {
		const { user } = interaction;
		const target = interaction.options.getUser("user");
		const boolean = interaction.options.getBoolean("send-dm");

		if (!target)
			return interaction.reply({
				embeds: [
					new EmbedBuilder().setDescription(
						`The user ${target} is not in this server`,
					),
				],
				ephemeral: true,
			});

		const gifFolder = "./gifs/kiss";
		const gifFiles = fs
			.readdirSync(gifFolder)
			.filter((file) => file.endsWith(".gif"));

		const randomIndex = Math.floor(Math.random() * gifFiles.length);
		const randomGif = gifFiles[randomIndex];

		if (boolean === true) {
			const embed = new EmbedBuilder()
				.setTitle("Kissing Notification")
				.setColor("DarkVividPink")
				.setDescription(`You got a **kiss** from ${user}`)
				.setImage(`attachment://${randomGif}`)
				.setFooter({ text: `Requested by ${user.username}` });

			await target.send({ embeds: [embed] });
			interaction.reply({
				content: "Embed was sent successfully",
				ephemeral: true,
			});
			return;
		}
		const embed = new EmbedBuilder()
			.setTitle("Kissing Notification")
			.setColor("DarkVividPink")
			.setDescription(`You got a **kiss** from ${user}`)
			.setImage(`attachment://${randomGif}`)
			.setFooter({ text: `Requested by ${user.username}` });

		interaction.reply({
			content: `${target}`,
			embeds: [embed],
			files: [attachment],
		});

		target.send({
			content: `${user} just tagged you in a post look now\n${interaction.channel}`,
		});
	},
};
