const {
	SlashCommandBuilder,
	EmbedBuilder,
	AttachmentBuilder,
	CommandInteraction,
	Client,
} = require("discord.js");
const fs = require("fs");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("slap")
		.setDescription("Give a user a slap.")
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

		const gifFolder = "./gifs/slap";
		const gifFiles = fs
			.readdirSync(gifFolder)
			.filter((file) => file.endsWith(".gif"));

		const randomIndex = Math.floor(Math.random() * gifFiles.length);
		const randomGif = gifFiles[randomIndex];

		if (!target)
			return interaction.reply({
				embeds: [
					new EmbedBuilder().setDescription(
						`The user ${target} is not in this server`,
					),
				],
				ephemeral: true,
			});

		const embed = new EmbedBuilder()
			.setTitle("Slapping Notification")
			.setColor("DarkVividPink")
			.setDescription(`You got a **Slap** from ${user}`)
			.setImage(`attachment://${randomGif}`)
			.setFooter({ text: `Requested by ${user.username}` });

		const attachment = new AttachmentBuilder(gifFolder + "/" + randomGif);

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
