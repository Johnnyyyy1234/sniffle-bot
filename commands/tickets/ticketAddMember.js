const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("ticket-add")
		.setDescription("Add a member to a ticket.")
		.addUserOption((o) =>
			o
				.setName("member")
				.setDescription("The member to add to the ticket.")
				.setRequired(true),
		),
	userPermissions: [],
	botPermissions: [],
	run: async (client, interaction) => {
		try {
			const { channel, options, guild } = interaction;
			await interaction.deferReply();

			const memberToAdd = options.getUser("member");

			const memberExistsInServer = guild.members.cache.find(
				(mbr) => mbr.id === memberToAdd.id,
			);
			if (!memberExistsInServer) {
				return await interaction.editReply({
					content: "The member you specified is not in the server.",
				});
			}

			const threadMember = await channel.members
				.fetch(memberToAdd.id)
				.catch((err) => {
					console.log(err);
				});

			if (threadMember) {
				return await interaction.editReply({
					content: "The member you specified is already in the ticket.",
				});
			}

			await channel.members.add(memberToAdd.id);

			return await interaction.editReply({
				content: `Successfully added ${memberToAdd} to the ticket.`,
			});
		} catch (error) {
			console.log(error);
		}
	},
};
