const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("ticket-remove")
		.setDescription("Remove a member or role from a ticket.")
		.addUserOption((o) =>
			o
				.setName("member")
				.setDescription("The member to remove from a ticket.")
				.setRequired(false),
		)
		.addRoleOption((o) =>
			o
				.setName("role")
				.setDescription("The role to remove from a ticket.")
				.setRequired(false),
		),
	userPermissions: [],
	botPermissions: [],
	run: async (client, interaction) => {
		try {
			const { channel, options, guild } = interaction;
			await interaction.deferReply();

			const memberToRemove = options.getUser("member");
			const roleToRemove = options.getRole("role");

			if (!memberToRemove && !roleToRemove) {
				return await interaction.editReply({
					content:
						"Please provide either a member or a role to remove from the ticket.",
				});
			}

			const removedMembers = [];

			if (memberToRemove) {
				const memberExistsInServer = guild.members.cache.find(
					(mbr) => mbr.id === memberToRemove.id,
				);
				if (!memberExistsInServer) {
					return await interaction.editReply({
						content: "The member you specified is not in the server.",
					});
				}

				const threadMember = await channel.members
					.fetch(memberToRemove.id)
					.catch((err) => {
						console.log(err);
					});

				if (!threadMember) {
					return await interaction.editReply({
						content: "The member you specified isn't in the ticket.",
					});
				}

				await channel.members.remove(memberToRemove.id);
				removedMembers.push(memberToRemove.toString());
			}

			if (roleToRemove) {
				const threadMembers = await channel.members.fetch();
				const membersWithRole = [];

				for (const [_, threadMember] of threadMembers) {
					const guildMember = await guild.members.fetch(threadMember.id);
					const memberRoles = guildMember.roles.cache;
					const highestRole = memberRoles.reduce((prev, curr) =>
						curr.position > prev.position ? curr : prev,
					);

					if (highestRole.id === roleToRemove.id) {
						membersWithRole.push(threadMember);
					}
				}
				// Do not mention them after removing. You will just add them back
				await interaction.editReply({
					content: "Removing...",
				});

				for (const member of membersWithRole) {
					await channel.members.remove(member.id);
					removedMembers.push(member.user.toString());

					// Delay to avoid hitting rate limits
					await new Promise((resolve) => setTimeout(resolve, 1000));
				}
			}
		} catch (error) {
			console.log(error);
		}
	},
};
