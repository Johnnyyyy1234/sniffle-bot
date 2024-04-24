const {
	SlashCommandBuilder,
	PermissionFlagsBits,
	ChannelType,
} = require("discord.js");
const errorHandler = require("../../utils/errorHandler");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("ticket-close")
		.setDescription("Closes the ticket you are currently in.")
		.addStringOption((o) =>
			o
				.setName("archive")
				.setDescription("Do you want to archive this ticket?")
				.addChoices({ name: "Yes", value: "Yes" }, { name: "No", value: "No" })
				.setRequired(true),
		)
		.toJSON(),
	userPermissions: [],
	botPermissions: [],
	run: async (client, interaction) => {
		try {
			const { channel, guild } = interaction;
			await interaction.deferReply();

			if (
				channel.type !== ChannelType.PublicThread ||
				channel.type !== ChannelType.PrivateThread
			) {
				return await interaction.editReply({
					content: "This command can only be used in a ticket thread.",
				});
			}

			const archiveOption = interaction.options.getString("archive");

			if (archiveOption === "Yes") {
				await interaction.editReply({ content: "Ticket Locked and Archived." });
				await channel.setLocked(true);
				await channel.setArchived(true);
			} else {
				await interaction.editReply({ content: "Ticket deleted." });
				await channel.delete();
			}
		} catch (error) {
			console.log(error);
		}
	},
};
