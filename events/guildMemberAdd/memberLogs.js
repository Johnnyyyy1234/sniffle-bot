const { EmbedBuilder, ChannelType } = require("discord.js");
const mConfig = require("../../messageConfig.json");
const loggingSchema = require("../../schemas/auditlogging");
const errorHandler = require("../../utils/errorHandler");

module.exports = async (client, member) => {
	try {
		const dataGD = await loggingSchema.findOne({ GuildID: member.guild.id });
		if (!dataGD) return;

		const memberLogsEnabled = dataGD.MemberLogs?.some(
			(log) => log.name === "MemberAdd" && log.enabled,
		);
		if (!memberLogsEnabled) return;

		const logChannelId = dataGD.Webhooks?.[0]?.channelId;
		if (!logChannelId) return;

		const logChannel = await member.guild.channels
			.fetch(logChannelId)
			.catch(() => null);
		if (!logChannel) return;

		const memberJoinedEmbed = new EmbedBuilder()
			.setTitle("Member Joined")
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
					name: "Joined Server",
					value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`,
					inline: true,
				},
				{ name: "Bot", value: member.user.bot ? "Yes" : "No", inline: true },
				{
					name: "Flags",
					value: member.user.flags
						? member.user.flags.toArray().join(", ") || "None"
						: "None",
					inline: true,
				},
			])
			.setColor(mConfig.embedColorSuccess)
			.setTimestamp();

		logChannel.send({ embeds: [memberJoinedEmbed] });
	} catch (error) {
		console.log(error);
	}
};
