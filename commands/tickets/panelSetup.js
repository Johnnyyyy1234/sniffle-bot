const {
	SlashCommandBuilder,
	PermissionFlagsBits,
	ChannelType,
	EmbedBuilder,
} = require("discord.js");
const ticketPanelSetup = require("../../schemas/ticketPanelSetup");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("setup-ticket-panel")
		.setDescription("Setup a ticket panel.")
		.addChannelOption((option) =>
			option
				.setName("channel")
				.setDescription("The channel where the ticket panel should be created.")
				.setRequired(true)
				.addChannelTypes(ChannelType.GuildText),
		)
		.addStringOption((option) =>
			option
				.setName("panel_name")
				.setDescription("A unique name or identifier for the ticket panel.")
				.setRequired(true),
		)
		.addStringOption((option) =>
			option
				.setName("title")
				.setDescription("The title of the ticket panel embed."),
		)
		.addStringOption((option) =>
			option
				.setName("description")
				.setDescription("The description of the ticket panel embed."),
		)
		.addStringOption((option) =>
			option
				.setName("color")
				.setDescription(
					"The color of the ticket panel embed (e.g., in hexadecimal format).",
				),
		)
		.toJSON(),

	userPermissions: [PermissionFlagsBits.Administrator],
	botPermissions: [],
	devOnly: true,
	run: async (client, interaction) => {
		try {
			const channel = interaction.options.getChannel("channel");
			const panelName = interaction.options.getString("panel_name");
			const title = interaction.options.getString("title");
			const description = interaction.options.getString("description");
			const color = interaction.options.getString("color");

			const embed = new EmbedBuilder()
				.setTitle(title || "Ticket Panel")
				.setDescription(
					description || "Click the button below to open a ticket.",
				)
				.setColor(color || "Random")
				.setFooter({ text: `Panel Name: ${panelName}` });

			const message = await channel.send({
				embeds: [embed],
			});

			await ticketPanelSetup.create({
				guildID: interaction.guild.id,
				channelID: channel.id,
				messageID: message.id,
				panelName: panelName,
				embed: {
					title: title || "Ticket Panel",
					description:
						description || "Click the button below to open a ticket.",
					color: color || "Random",
				},
			});

			await interaction.reply({
				content: "Ticket panel setup successfully!",
				ephemeral: true,
			});
		} catch (error) {
			console.log(error);
		}
	},
};
