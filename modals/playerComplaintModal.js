const { EmbedBuilder, ChannelType } = require("discord.js");
const ticketSetupSchema = require("../schemas/ticketSetupSchema");
const playerComplaintSchema = require("../schemas/playerComplaints");

module.exports = {
	customId: "playerComplaintMdl",
	userPermissions: [],
	botPermissions: [],
	devOnly: false,
	run: async (client, interaction) => {
		try {
			const { fields, guild, member, channel } = interaction;

			const q1 = fields.getTextInputValue("playerID");
			const q2 = fields.getTextInputValue("dateOfOccurrence");
			const q3 = fields.getTextInputValue("ruleBreak");
			const q4 = fields.getTextInputValue("situation");
			const q5 = fields.getTextInputValue("evidence");

			await interaction.deferReply({ ephemeral: true });

			const ticketSetup = await ticketSetupSchema.findOne({
				guildID: guild.id,
				ticketChannelID: channel.id,
			});

			const ticketChannel = guild.channels.cache.find(
				(ch) => ch.id === ticketSetup.ticketChannelID,
			);
			const username = member.user.globalName ?? member.user.username;

			// Find the staff members with the allowed roles
			const staffMembers = await findStaffMembersWithAllowedRoles(
				guild,
				ticketSetup.staffRoles,
			);

			if (staffMembers.length === 0) {
				return await interaction.editReply({
					content: "No available staff members found with the allowed roles.",
				});
			}

			// Find the staff member with the least number of assigned complaints
			const assignedStaffMember = await findStaffMemberWithLeastComplaints(
				guild,
				staffMembers,
			);

			const ticketEmbed = new EmbedBuilder()
				.setColor("DarkGreen")
				.setAuthor({
					name: username,
					iconURL: member.displayAvatarURL({ dynamic: true }),
				})
				.setDescription(
					`**Player ID** ${q1}\n\n**Date of Occurrence?** ${q2}\n\n**What rule break did you feel occur?** ${q3}\n\n**Explain the situation.** ${q4}\n\n**Evidence** ${q5}`,
				)
				.setFooter({
					text: `${guild.name} - Player Complaint`,
					iconURL: guild.iconURL(),
				})
				.setTimestamp();

			const thread = await ticketChannel.threads.create({
				name: `${username}'s Player Complaint`,
				type: ChannelType.PrivateThread,
			});

			await thread.send({
				content: `${assignedStaffMember} - Player Complaint Created By ${member}`,
				embeds: [ticketEmbed],
			});

			// Create a new player complaint document
			await playerComplaintSchema.findOneAndUpdate(
				{
					GuildID: guild.id,
					userID: assignedStaffMember.id,
				},
				{
					$inc: { count: 1 },
				},
				{
					upsert: true,
					new: true,
				},
			);

			return await interaction.editReply({
				content: `Your player complaint has been created in ${thread} and assigned to ${assignedStaffMember}.`,
			});
		} catch (error) {
			console.log(error);
		}
	},
};

async function findStaffMembersWithAllowedRoles(guild, allowedRoles) {
	const staffMembers = [];

	for (const member of guild.members.cache.values()) {
		if (member.roles.cache.some((role) => allowedRoles.includes(role.id))) {
			staffMembers.push(member);
		}
	}

	return staffMembers;
}

async function findStaffMemberWithLeastComplaints(guild, staffMembers) {
	const staffMembersWithComplaints = await Promise.all(
		staffMembers.map(async (member) => {
			const playerComplaints = await playerComplaintSchema.countDocuments({
				GuildID: guild.id,
				assignedTo: member.id,
			});
			return { member, complaintCount: playerComplaints };
		}),
	);

	const staffWithNoComplaints = staffMembers.filter(
		(member) =>
			!staffMembersWithComplaints.some(
				(staff) => staff.member.id === member.id,
			),
	);

	if (staffWithNoComplaints.length > 0) {
		const randomIndex = Math.floor(
			Math.random() * staffWithNoComplaints.length,
		);
		return staffWithNoComplaints[randomIndex];
	}

	const minComplaintCount = Math.min(
		...staffMembersWithComplaints.map((staff) => staff.complaintCount),
	);

	const staffWithMinComplaints = staffMembersWithComplaints.filter(
		(staff) => staff.complaintCount === minComplaintCount,
	);

	const randomIndex = Math.floor(Math.random() * staffWithMinComplaints.length);
	return staffWithMinComplaints[randomIndex].member;
}
