const {
	EmbedBuilder,
	ChannelType,
	time,
	AuditLogEvent,
} = require("discord.js");
const mConfig = require("../../messageConfig.json");
const loggingSchema = require("../../schemas/auditlogging");

module.exports = async (client, auditLogEntry, guild) => {
	try {
		if (auditLogEntry.action !== AuditLogEvent.ChannelDelete) return;

		const logSchema = await loggingSchema.findOne({
			GuildID: guild.id,
		});

		if (
			!logSchema ||
			!logSchema.ChannelDelete.Enabled ||
			logSchema.ChannelDelete.ChannelID === ""
		)
			return;

		const { target, executor } = auditLogEntry;
		const logChannel = logSchema.ChannelDelete.ChannelID;
		const externalLogChannel = client.channels.cache.get(logChannel)

		const channelTypeNames = {
			[ChannelType.GuildText]: "Text",
			[ChannelType.GuildVoice]: "Voice",
			[ChannelType.GuildAnnouncement]: "Announcement",
			[ChannelType.AnnouncementThread]: "Announcement Thread",
			[ChannelType.PublicThread]: "Public Thread",
			[ChannelType.PrivateThread]: "Private Thread",
			[ChannelType.GuildCategory]: "Category",
			[ChannelType.GuildStageVoice]: "Stage",
			[ChannelType.GuildDirectory]: "Directory",
			[ChannelType.GuildForum]: "Forum",
		};
		const channelTypeName = channelTypeNames[target.type] || "Unknown";

		let settingsValue = `<:arrow:1236147217329422368> **Name:** ${target.name} \`${target.id}\`\n<:arrow:1236147217329422368> **Type:** ${channelTypeName}`;

		if (target.type !== ChannelType.GuildCategory) {
			settingsValue += `\n<:arrow:1236147217329422368> **NSFW:** ${
				target.nsfw
			}\n<:arrow:1236147217329422368> **User Rate Limit:** ${
				target.rateLimitPerUser || "None"
			}`;
		}

		const channelDeleteEmbed = new EmbedBuilder()
			.setTitle("Channel Delete")
			.setDescription(
				`<:arrow:1236147217329422368> **Responsible:** ${executor} \`${
					executor.id
				}\`\n<:arrow:1236147217329422368> ${time(target.createdAt, "F")}`,
			)
			.addFields({
				name: "Original Settings",
				value: settingsValue,
			})
			.setColor(mConfig.embedColorError);

			externalLogChannel.send({ embeds: [channelDeleteEmbed] });
	} catch (error) {
		console.error(error);
	}
};
