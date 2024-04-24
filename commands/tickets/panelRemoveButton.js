const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const ticketPanelSetup = require("../../schemas/ticketPanelSetup");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("remove-button")
		.setDescription("Remove a button from a ticket panel.")
		.addStringOption((option) =>
			option
				.setName("panel_name")
				.setDescription("The name or identifier of the ticket panel.")
				.setRequired(true),
		)
		.addStringOption((option) =>
			option
				.setName("button_label")
				.setDescription("The label or text of the button to remove.")
				.setRequired(true),
		)
		.toJSON(),

	userPermissions: [PermissionFlagsBits.Administrator],
	botPermissions: [],
	devOnly: true,
	run: async (client, interaction) => {
		try {
			const panelName = interaction.options.getString("panel_name");
			const buttonLabel = interaction.options.getString("button_label");

			const panel = await ticketPanelSetup.findOne({
				panelName: panelName,
				guildID: interaction.guild.id,
			});

			if (!panel) {
				return interaction.reply({
					content: "The specified ticket panel does not exist.",
					ephemeral: true,
				});
			}

			const buttonIndex = panel.buttons.findIndex(
				(button) => button.buttonLabel === buttonLabel,
			);

			if (buttonIndex === -1) {
				return interaction.reply({
					content: "The specified button does not exist in the ticket panel.",
					ephemeral: true,
				});
			}

			panel.buttons.splice(buttonIndex, 1);
			await panel.save();

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

			const actionRow = message.components[0];
			if (actionRow) {
				const updatedComponents = actionRow.components.filter(
					(component) => component.data.label !== buttonLabel,
				);
				actionRow.components = updatedComponents;
				await message.edit({ components: [actionRow] });
			}

			await interaction.reply({
				content: "Button removed from the ticket panel successfully!",
				ephemeral: true,
			});
		} catch (error) {
			console.log(error);
			await interaction.reply({
				content:
					"An error occurred while removing the button from the ticket panel.",
				ephemeral: true,
			});
		}
	},
};
