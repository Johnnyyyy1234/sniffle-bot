const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const ticketPanelSetup = require("../../schemas/ticketPanelSetup");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("remove-ticket-panel")
		.setDescription("Remove a ticket panel.")
		.addStringOption((option) =>
			option
				.setName("panel_name")
				.setDescription("The unique name or identifier of the ticket panel.")
				.setRequired(true),
		)
		.toJSON(),

	userPermissions: [PermissionFlagsBits.Administrator],
	botPermissions: [],
	devOnly: true,
	run: async (client, interaction) => {
		try {
			const panelName = interaction.options.getString("panel_name");

			const panel = await ticketPanelSetup.findOne({
				guildID: interaction.guild.id,
				panelName: panelName,
			});

			if (!panel) {
				return interaction.reply({
					content: "The specified ticket panel does not exist.",
					ephemeral: true,
				});
			}

			const channel = await client.channels.fetch(panel.channelID);
			if (!channel) {
				await ticketPanelSetup.deleteOne({ _id: panel._id });
				return interaction.reply({
					content:
						"The channel associated with the ticket panel no longer exists. The panel has been removed from the database.",
					ephemeral: true,
				});
			}

			const message = await channel.messages.fetch(panel.messageID);
			if (!message) {
				await ticketPanelSetup.deleteOne({ _id: panel._id });
				return interaction.reply({
					content:
						"The message associated with the ticket panel no longer exists. The panel has been removed from the database.",
					ephemeral: true,
				});
			}

			await message.delete();
			await ticketPanelSetup.deleteOne({ _id: panel._id });

			await interaction.reply({
				content: "Ticket panel removed successfully!",
				ephemeral: true,
			});
		} catch (error) {
			console.log(error);
			await interaction.reply({
				content: "An error occurred while removing the ticket panel.",
				ephemeral: true,
			});
		}
	},
};
