const { EmbedBuilder, ChannelType, AuditLogEvent } = require("discord.js");
const errorHandler = require("../../utils/errorHandler");
const mConfig = require("../../messageConfig.json");
const loggingSchema = require("../../schemas/auditlogging");

module.exports = async (client, auditLogEntry, guild) => {
	try {
		const dataGD = await loggingSchema.findOne({ GuildID: guild.id });
		if (!dataGD) return;

		const memberLogsEnabled = dataGD.MemberLogs?.some(
			(log) => log.name === "MemberPrune" && log.enabled,
		);
		if (!memberLogsEnabled) return;

		const logChannelId = dataGD.Webhooks?.[0]?.channelId;
		if (!logChannelId) return;

		const logChannel = await guild.channels
			.fetch(logChannelId)
			.catch(() => null);
		if (!logChannel) return;

		// Check if it's a member prune event
		if (auditLogEntry.action !== AuditLogEvent.MemberPrune) return;

		const { executor, extra } = auditLogEntry;
		const prunedMembers = extra.removed; // Number of members pruned

		const memberPruneEmbed = new EmbedBuilder()
			.setTitle("Members Pruned")
			.setDescription(
				`**Members Pruned:** ${prunedMembers}\n\n**Executor:** ${executor} (${executor.globalName})\n**ID:** ${executor.id}`,
			)
			.setColor(mConfig.embedColorError)
			.setTimestamp();

		logChannel.send({ embeds: [memberPruneEmbed] });
	} catch (error) {
		console.log(error);
	}
};
