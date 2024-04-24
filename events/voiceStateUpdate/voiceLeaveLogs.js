const { EmbedBuilder, ChannelType } = require("discord.js");
const errorHandler = require("../../utils/errorHandler");
const mConfig = require("../../messageConfig.json");
const loggingSchema = require("../../schemas/auditlogging");

module.exports = async (client, oldState, newState) => {
	try {
		const dataGD = await loggingSchema.findOne({ GuildID: newState.guild.id });
		if (!dataGD) return;

		const memberLogsEnabled = dataGD.MemberLogs?.some(
			(log) => log.name === "MemberDisconnect" && log.enabled,
		);
		if (!memberLogsEnabled) return;

		const logChannelId = dataGD.Webhooks?.[0]?.channelId;
		if (!logChannelId) return;

		const logChannel = await newState.guild.channels
			.fetch(logChannelId)
			.catch(() => null);
		if (!logChannel) return;

		// Check if it's a disconnect
		if (!oldState.channel && newState.channel) return; // Member joined
		if (oldState.channel && !newState.channel) {
			// Member disconnected

			const member = newState.member;

			const memberDisconnectEmbed = new EmbedBuilder()
				.setTitle("Voice Disconnect")
				.setDescription(
					`**User:** ${member} (${member.user.globalName})\n**ID:** ${member.id}\n\n**Channel:** ${oldState.channel.name}`,
				)
				.setColor(mConfig.embedColorWarning)
				.setTimestamp();

			logChannel.send({ embeds: [memberDisconnectEmbed] });
		}
	} catch (error) {
		console.log(error);
	}
};
