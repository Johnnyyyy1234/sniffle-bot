const {
	SlashCommandBuilder,
	PermissionFlagsBits,
	ChannelType,
	EmbedBuilder,
} = require("discord.js");
const boostSchema = require("../../schemas/boostSchema");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("boost-setup")
		.setDescription("Setup the boost event.")
		.addChannelOption((o) =>
			o
				.setName("boost-channel")
				.setDescription("The channel to send the boost message to.")
				.setRequired(true),
		)
		.addStringOption((o) =>
			o
				.setName("embed-color")
				.setDescription("The color of the embed.")
				.setRequired(true)
				.setMaxLength(7),
		)
		.addStringOption((o) =>
			o
				.setName("embed-title")
				.setDescription("The title of the embed.")
				.setRequired(true),
		)
		.addStringOption((o) =>
			o
				.setName("embed-message")
				.setDescription("The message of the embed.")
				.setRequired(true),
		)
		.addStringOption((o) =>
			o
				.setName("message")
				.setDescription("The message to send. (Use [m] to ping the member.")
				.setRequired(true),
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	userPermissions: [PermissionFlagsBits.Administrator],
	botPermissions: [],
	run: async (client, interaction) => {
		try {
			await interaction.deferReply({ ephemeral: true });

			const { options, guild } = interaction;

			const boostChannel = options.getChannel("boost-channel");
			const embedColor = options.getString("embed-color");
			const embedTitle = options.getString("embed-title");
			const embedMessage = options.getString("embed-message");
			const boostMessage = options.getString("message");

			let boostData = await boostSchema.findOne({
				guildID: guild.id,
			});

			if (boostData) {
				return await interaction.editReply({
					content: "The boost event has already been setup.",
				});
			}
			boostData = await boostSchema.create({
				guildID: guild.id,
				boostingChannelID: boostChannel.id,
				boostEmbedColor: embedColor,
				boostEmbedTitle: embedTitle,
				boostEmbedMsg: embedMessage,
				boostMsg: boostMessage,
			});

			const boostEmbed = new EmbedBuilder()
				.setTitle(embedTitle)
				.setColor(embedColor)
				.setDescription(embedMessage);

			return interaction.editReply({
				content: `The boost event has been setup. The boost message will be sent in ${boostChannel}`,
				embeds: [boostEmbed],
			});
		} catch (error) {
			console.log(error);
		}
	},
};
