const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { v4: uuidv4 } = require("uuid");
const ticketSetupSchema = require("../../schemas/ticketSetupSchema");
const ticketSchema = require("../../schemas/ticketSchema");
const errorHandler = require("../../utils/errorHandler");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("ticket-send")
		.setDescription("Send a message/question to a person not in this ticket.")
		.addUserOption((o) =>
			o.setName("user").setDescription("The member.").setRequired(true),
		)
		.addStringOption((o) =>
			o
				.setName("message")
				.setDescription("What would you like to say?")
				.setRequired(true)
				.setMaxLength(1000),
		)
		.setDMPermission(false)
		.toJSON(),
	userPermissions: [],
	botPermissions: [],
	run: async (client, interaction) => {
		try {
			const { channel, guild, user } = interaction;
			await interaction.deferReply();

			const ticketSetup = await ticketSetupSchema.findOne({
				guildID: guild.id,
			});

			if (!ticketSetup)
				return interaction.editReply("This server has not setup tickets yet.");

			if (!channel.isThread())
				return interaction.editReply(
					"This command can only be run within a ticket thread.",
				);

			const recipient = interaction.options.getUser("user");
			const message = interaction.options.getString("message");

			// Check if the user is trying to send a message to themselves
			if (user.id === recipient.id)
				return interaction.editReply("You cannot send a message to yourself.");

			// Check if the user is trying to send a message to a bot
			if (recipient.bot)
				return interaction.editReply("You cannot send a message to a bot.");

			// Check if the recipient is a member of the guild
			const member = await guild.members.fetch(recipient.id).catch(() => null);
			if (!member)
				return interaction.editReply(
					"The selected user is not a member of this server.",
				);

			// Check if the message is empty or whitespace-only
			if (!message.trim())
				return interaction.editReply("Please provide a non-empty message.");

			// Generate a unique ID for the message
			const messageId = uuidv4();

			try {
				// Send DM to the recipient with the message ID
				await recipient.send(
					`You have received a message from ${user.tag} in a ticket (ID: ${messageId}):\n\n${message}`,
				);
			} catch (error) {
				// Handle the case when the bot is unable to send the DM
				return interaction.editReply(
					"Unable to send the message. The recipient might have DMs disabled or has blocked the bot.",
				);
			}

			await ticketSchema.create({
				guildID: guild.id,
				executorID: user.id,
				recipientID: recipient.id,
				threadID: channel.id,
				messageID: messageId,
			});

			await interaction.editReply(
				`Message sent to ${recipient.tag} successfully.`,
			);
		} catch (error) {
			console.log(error);
		}
	},
};
