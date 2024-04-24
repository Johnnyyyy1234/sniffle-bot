const { EmbedBuilder, AuditLogEvent } = require("discord.js");
const errorHandler = require("../../utils/errorHandler");
const mConfig = require("../../messageConfig.json");
const loggingSchema = require("../../schemas/auditlogging");

module.exports = async (client, auditLogEntry, guild) => {
	try {
		if (auditLogEntry.action !== AuditLogEvent.MemberBanAdd) return;

		const dataGD = await loggingSchema.findOne({ GuildID: guild.id });
		if (!dataGD) return;

		const memberLogsEnabled = dataGD.MemberLogs?.some(
			(log) => log.name === "MemberBanAdd" && log.enabled,
		);
		if (!memberLogsEnabled) return;

		const logChannelId = dataGD.Webhooks?.[0]?.channelId;
		if (!logChannelId) return;

		const logChannel = guild.channels.cache.get(logChannelId);
		if (!logChannel) return;

		const { target, executor } = auditLogEntry;
		const memberBanEmbed = new EmbedBuilder()
			.setTitle("Member Banned")
			.setDescription(
				`**User:** ${target.globalName} (${target.id})\n**Executor:** ${executor.globalName} (${executor.id})`,
			)
			.setColor(mConfig.embedColorError)
			.setTimestamp();

		if (auditLogEntry.reason) {
			memberBanEmbed.addFields({ name: "Reason", value: auditLogEntry.reason });
		}

		logChannel.send({ embeds: [memberBanEmbed] });
	} catch (error) {
		console.log(error);
	}
};
