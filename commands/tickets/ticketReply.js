const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const ticketSchema = require("../../schemas/ticketSchema");
const errorHandler = require("../../utils/errorHandler");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("ticket-reply")
		.setDescription("Respond to a message received from a ticket.")
		.addStringOption((o) =>
			o
				.setName("id")
				.setDescription("The ID of the message.")
				.setRequired(true),
		)
		.addStringOption((o) =>
			o
				.setName("response")
				.setDescription("Your response to the message.")
				.setRequired(true)
				.setMaxLength(1000),
		)
		.setDMPermission(true)
		.toJSON(),
	userPermissions: [],
	botPermissions: [],
	run: async (client, interaction) => {
		try {
			const { guild, user } = interaction;

			// Check if the command is being run inside a guild
			if (guild)
				return interaction.reply(
					"This command can only be used in a DM with the bot.",
				);

			await interaction.deferReply();

			const messageId = interaction.options.getString("id");
			const response = interaction.options.getString("response");

			// Check if the message ID exists in the database
			const ticket = await ticketSchema.findOne({ messageID: messageId });

			if (!ticket)
				return interaction.editReply(
					"Invalid message ID. Please provide a valid ID.",
				);

			// Check if the user responding is the recipient of the message
			if (ticket.recipientID !== user.id)
				return interaction.editReply(
					"You are not authorized to respond to this message.",
				);

			// Check if the response is empty or whitespace-only
			if (!response.trim())
				return interaction.editReply("Please provide a non-empty response.");

			try {
				// Fetch the thread using the stored thread ID
				const thread = await client.channels.fetch(ticket.threadID);

				// Send the response to the thread
				await thread.send(
					`${user.tag} has responded to the message (ID: ${messageId}):\n\n${response}`,
				);
			} catch (error) {
				// Handle the case when the bot is unable to send the message to the thread
				return interaction.editReply(
					"Unable to send the response. The ticket thread might have been deleted or the bot lacks permissions.",
				);
			}

			// Delete the ticket record from the database
			await ticketSchema.findOneAndDelete({ messageID: messageId });

			await interaction.editReply("Your response has been sent successfully.");
		} catch (error) {
			console.log(error);
		}
	},
};
