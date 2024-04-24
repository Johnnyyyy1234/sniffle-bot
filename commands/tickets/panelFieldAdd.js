const {
	SlashCommandBuilder,
	PermissionFlagsBits,
	ChannelType,
	EmbedBuilder,
} = require("discord.js");
const ticketPanelSetup = require("../../schemas/ticketPanelSetup");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("add-panel-field")
		.setDescription("Add fields to a ticket panel.")
		.addStringOption((option) =>
			option
				.setName("panel_name")
				.setDescription("The name or identifier of the ticket panel.")
				.setRequired(true),
		)
		.addStringOption((option) =>
			option
				.setName("field_name")
				.setDescription("The name or title of the field.")
				.setRequired(true),
		)
		.addStringOption((option) =>
			option
				.setName("field_value")
				.setDescription("The value or content of the field.")
				.setRequired(true),
		)
		.addBooleanOption((option) =>
			option
				.setName("inline")
				.setDescription("Whether the field should be displayed inline."),
		)
		.toJSON(),

	userPermissions: [PermissionFlagsBits.Administrator],
	botPermissions: [],
	devOnly: true,
	run: async (client, interaction) => {
		try {
			const panelName = interaction.options.getString("panel_name");
			const fieldName = interaction.options.getString("field_name");
			const fieldValue = interaction.options.getString("field_value");
			const inline = interaction.options.getBoolean("inline") || false;

			const panel = await ticketPanelSetup.findOne({ panelName: panelName });

			if (!panel) {
				return interaction.reply({
					content: "The specified ticket panel does not exist.",
					ephemeral: true,
				});
			}

			const channel = await client.channels.fetch(panel.channelID);
			if (!channel) {
				return interaction.reply({
					content:
						"The channel associated with the ticket panel no longer exists.",
					ephemeral: true,
				});
			}

			const message = await channel.messages.fetch(panel.messageID);
			if (!message) {
				return interaction.reply({
					content:
						"The message associated with the ticket panel no longer exists.",
					ephemeral: true,
				});
			}

			const embed = message.embeds[0];
			if (!embed) {
				return interaction.reply({
					content: "The ticket panel embed no longer exists.",
					ephemeral: true,
				});
			}

			const updatedEmbed = EmbedBuilder.from(embed).addFields({
				name: fieldName,
				value: fieldValue,
				inline: inline,
			});

			await message.edit({ embeds: [updatedEmbed] });

			await panel.updateOne({
				$push: {
					"embed.fields": {
						name: fieldName,
						value: fieldValue,
						inline: inline,
					},
				},
			});

			await interaction.reply({
				content: "Panel field added successfully!",
				ephemeral: true,
			});
		} catch (error) {
			console.log(error);
			await interaction.reply({
				content: "An error occurred while adding the panel field.",
				ephemeral: true,
			});
		}
	},
};
