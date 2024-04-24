const { EmbedBuilder, AuditLogEvent } = require("discord.js");
const errorHandler = require("../../utils/errorHandler");
const mConfig = require("../../messageConfig.json");
const loggingSchema = require("../../schemas/auditlogging");

module.exports = async (client, auditLogEntry, guild) => {
	try {
		if (auditLogEntry.action !== AuditLogEvent.MemberRoleUpdate) return;

		const dataGD = await loggingSchema.findOne({ GuildID: guild.id });
		if (!dataGD) return;

		const memberLogsEnabled = dataGD.MemberLogs?.some(
			(log) => log.name === "MemberUpdate" && log.enabled,
		);
		if (!memberLogsEnabled) return;

		const logChannelId = dataGD.Webhooks?.[0]?.channelId;
		if (!logChannelId) return;

		const logChannel = await guild.channels
			.fetch(logChannelId)
			.catch(() => null);
		if (!logChannel) return;

		const { changes, target, executor } = auditLogEntry;
		const roleChanges = changes.filter(
			(change) => change.key === "$add" || change.key === "$remove",
		);

		if (roleChanges.length > 0) {
			const memberUpdateEmbed = new EmbedBuilder()
				.setTitle("Member Role Update")
				.setColor(mConfig.embedColorWarning)
				.setTimestamp();

			for (const change of roleChanges) {
				const roleName = change.new[0].name;
				const action = change.key === "$add" ? "added to" : "removed from";

				memberUpdateEmbed.setDescription(
					`${target} has had the role **${roleName}** ${action} them by ${executor}.`,
				);
			}

			logChannel.send({ embeds: [memberUpdateEmbed] });
		}
	} catch (error) {
		console.log(error);
	}
};
