const { EmbedBuilder, ChannelType, AuditLogEvent } = require("discord.js");
const mConfig = require("../../messageConfig.json");
const loggingSchema = require("../../schemas/auditlogging");
const errorHandler = require("../../utils/errorHandler");

module.exports = async (client, member) => {
	try {
		const dataGD = await loggingSchema.findOne({ GuildID: member.guild.id });
		if (!dataGD) return;

		const memberLogsEnabled = dataGD.MemberLogs?.some(
			(log) => log.name === "MemberRemove" && log.enabled,
		);
		if (!memberLogsEnabled) return;

		const logChannelId = dataGD.Webhooks?.[0]?.channelId;
		if (!logChannelId) return;

		const logChannel = await member.guild.channels
			.fetch(logChannelId)
			.catch(() => null);
		if (!logChannel) return;

		if (member.partial) {
			// Fetch audit logs to try and recover member data
			let latestMemberRemoveEntry = null;
			const fetchGuildAuditLogs = await member.guild.fetchAuditLogs({
				limit: 1,
				type: AuditLogEvent.MemberRemove,
			});
			latestMemberRemoveEntry = fetchGuildAuditLogs.entries.first();

			const memberLeftEmbed = new EmbedBuilder()
				.setTitle("Member Left (Partial)")
				.setDescription(
					`**User:** ${member} (${member.user.tag})\n**ID:** ${member.id}`,
				)
				.setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
				.addFields([
					{ name: "Bot", value: member.user.bot ? "Yes" : "No", inline: true },
				])
				.setColor(mConfig.embedColorError)
				.setTimestamp();

			// Update fields if we have the audit log data
			if (
				latestMemberRemoveEntry &&
				latestMemberRemoveEntry.target.id === member.id
			) {
				const { target } = latestMemberRemoveEntry;

				memberLeftEmbed.setDescription(
					`**User:** ${target} (${target.tag})\n**ID:** ${target.id}`,
				);
				memberLeftEmbed.setThumbnail(
					target.displayAvatarURL({ dynamic: true }),
				);
				memberLeftEmbed.spliceFields(0, 2, [
					{
						name: "Account Created",
						value: `<t:${Math.floor(target.createdTimestamp / 1000)}:R>`,
						inline: true,
					},
					{
						name: "Duration in Server",
						value: calculateDuration(target.joinedTimestamp),
						inline: true,
					},
				]);
			}

			logChannel.send({ embeds: [memberLeftEmbed] });
		} else {
			// Member is not partial - normal logging process
			const memberLeftEmbed = new EmbedBuilder()
				.setTitle("Member Left")
				.setDescription(
					`**User:** ${member} (${member.user.tag})\n**ID:** ${member.id}`,
				)
				.setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
				.addFields([
					{
						name: "Account Created",
						value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`,
						inline: true,
					},
					{
						name: "Duration in Server",
						value: calculateDuration(member.joinedTimestamp),
						inline: true,
					},
					{ name: "Bot", value: member.user.bot ? "Yes" : "No", inline: true },
				])
				.setColor(mConfig.embedColorError)
				.setTimestamp();

			logChannel.send({ embeds: [memberLeftEmbed] });
		}
	} catch (error) {
		console.log(error);
	}
};

function calculateDuration(joinedTimestamp) {
	const durationMs = Date.now() - joinedTimestamp;
	let durationString = "";

	const years = Math.floor(durationMs / (1000 * 60 * 60 * 24 * 365.25));
	if (years > 0) durationString += `${years} year${years > 1 ? "s" : ""}, `;

	const months = Math.floor(
		(durationMs % (1000 * 60 * 60 * 24 * 365.25)) /
			(1000 * 60 * 60 * 24 * 30.44),
	);
	if (months > 0) durationString += `${months} month${months > 1 ? "s" : ""}, `;

	const days = Math.floor(
		(durationMs % (1000 * 60 * 60 * 24 * 30.44)) / (1000 * 60 * 60 * 24),
	);
	if (days > 0) durationString += `${days} day${days > 1 ? "s" : ""}, `;

	const hours = Math.floor(
		(durationMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
	);
	if (hours > 0) durationString += `${hours} hour${hours > 1 ? "s" : ""}, `;

	const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
	if (minutes > 0) {
		durationString += `${minutes} minute${minutes > 1 ? "s" : ""}`;
	} else if (durationString === "") {
		// Check for empty string
		durationString = "Less than a minute";
	}

	// Remove trailing comma and space, if any
	if (durationString.endsWith(", ")) {
		durationString = durationString.slice(0, -2);
	}

	return durationString;
}
