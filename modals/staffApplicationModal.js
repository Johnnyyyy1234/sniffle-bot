const { EmbedBuilder, ChannelType } = require("discord.js");
const ticketSetupSchema = require("../schemas/ticketSetupSchema");
const errorHandler = require("../utils/errorHandler");

module.exports = {
	customId: "staffApplicationMdl",
	userPermissions: [],
	botPermissions: [],
	devOnly: false,
	run: async (client, interaction) => {
		try {
			const { fields, guild, member, channel } = interaction;

			const q1 = fields.getTextInputValue("staffApp1");
			const q2 = fields.getTextInputValue("staffApp2");
			const q3 = fields.getTextInputValue("staffApp3");
			const q4 = fields.getTextInputValue("staffApp4");
			const q5 = fields.getTextInputValue("staffApp5");

			await interaction.deferReply({ ephemeral: true });

			const ticketSetup = await ticketSetupSchema.findOne({
				guildID: guild.id,
				ticketChannelID: channel.id,
			});

			const ticketChannel = guild.channels.cache.find(
				(ch) => ch.id === ticketSetup.ticketChannelID2,
			);
			const staffRoleIds = ticketSetup.staffRolesID2.flat();
			const staffRoles = staffRoleIds.map((roleId) =>
				guild.roles.cache.get(roleId),
			);
			const username = member.user.globalName ?? member.user.username;

			const ticketEmbed = new EmbedBuilder()
				.setColor("DarkGreen")
				.setAuthor({
					name: username,
					iconURL: member.displayAvatarURL({ dynamic: true }),
				})
				.setDescription(
					`**Why are you interested in joining the staff team?**\n${q1}\n\n**What could you bring to the staff team? Do you have any staff experience from elsewhere?**\n${q2}\n\n**Do you have any previous punishments?**\n${q3}\n\n**Do you have any interest in joining any of our departments beyond Support Team?**\n${q4}\n\n**What are your organisational and communication skills like?**\n${q5}`,
				)
				.setFooter({
					text: `${guild.name} - Staff Application`,
					iconURL: guild.iconURL(),
				})
				.setTimestamp();

			const thread = await ticketChannel.threads.create({
				name: `${username}'s Staff Application`,
				type: ChannelType.PrivateThread,
			});

			await thread.send({
				content: `${staffRoles
					.map((role) => role.toString())
					.join(", ")} - Staff Application Created By ${member}`,
				embeds: [ticketEmbed],
			});

			await thread.members.remove(member.id);

			return await interaction.editReply({
				content:
					"Your Staff Application has been created. Please wait patiently for a response.",
			});
		} catch (error) {
			console.log(error);
		}
	},
};
