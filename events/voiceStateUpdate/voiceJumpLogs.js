const { EmbedBuilder, ChannelType } = require("discord.js");
const errorHandler = require("../../utils/errorHandler");
const mConfig = require("../../messageConfig.json");
const loggingSchema = require("../../schemas/auditlogging");

module.exports = async (client, oldState, newState) => {
	try {
		const dataGD = await loggingSchema.findOne({ GuildID: newState.guild.id });
		if (!dataGD) return;

		const memberLogsEnabled = dataGD.MemberLogs?.some(
			(log) => log.name === "VoiceStateUpdate" && log.enabled,
		);
		if (!memberLogsEnabled) return;

		const logChannelId = dataGD.Webhooks?.[0]?.channelId;
		if (!logChannelId) return;

		const logChannel = await newState.guild.channels
			.fetch(logChannelId)
			.catch(() => null);
		if (!logChannel) return;

		// Check for channel switch
		if (oldState.channelId !== newState.channelId && oldState.channelId) {
			if (!newState.channel) return;
			const member = newState.member;
			const memberChannelSwitchEmbed = new EmbedBuilder()
				.setTitle("Voice Channel Switch")
				.setDescription(
					`**User:** ${member} (${member.user.globalName})\n**ID:** ${member.id}\n\n**Old Channel:** ${oldState.channel.name}\n**New Channel:** ${newState.channel.name}`,
				)
				.setColor(mConfig.embedColorSuccess)
				.setTimestamp();

			logChannel.send({ embeds: [memberChannelSwitchEmbed] });
		}
	} catch (error) {
		console.log(error);
	}
};
