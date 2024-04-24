const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const ticketSchema = require("../../schemas/ticketSchema");
const ticketSetupSchema = require("../../schemas/ticketSetupSchema");
const errorHandler = require("../../utils/errorHandler");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("ticket-lock")
		.setDescription("Locks the ticket you are currently in.")
		.toJSON(),
	userPermissions: [],
	botPermissions: [],
	run: async (client, interaction) => {
		try {
			const { channel, guild } = interaction;
			await interaction.deferReply();

			const ticket = await ticketSchema.findOne({
				guildID: guild.id,
				ticketChannelID: channel.id,
				closed: false,
			});

			if (!ticket) {
				return await interaction.editReply({
					content: "This channel is not a ticket channel.",
				});
			}

			const ticketSetup = await ticketSetupSchema.findOne({
				guildID: guild.id,
			});

			const member = await guild.members.fetch(interaction.user.id);

			if (!member.roles.cache.has(ticketSetup.staffRoleID)) {
				return await interaction.editReply({
					content: "You are not authorized to lock this ticket.",
				});
			}

			await interaction.editReply({
				content: "Successfully locked the ticket.",
			});

			return await channel.setLocked(true);
		} catch (error) {
			console.log(error);
		}
	},
};
