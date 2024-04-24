const {
	EmbedBuilder,
	ChannelType,
	PermissionFlagsBits,
	AuditLogEvent,
} = require("discord.js");
const errorHandler = require("../../utils/errorHandler");
const mConfig = require("../../messageConfig.json");
const loggingSchema = require("../../schemas/auditlogging");

module.exports = async (client, auditLogEntry, guild) => {
	try {
		// Check if the audit log entry is for a channel creation
		if (auditLogEntry.action !== AuditLogEvent.ChannelCreate) return;

		const dataGD = await loggingSchema.findOne({ GuildID: guild.id });
		if (!dataGD) return;

		const channelLogsEnabled = dataGD.ChannelLogs?.some(
			(log) => log.name === "ChannelCreate" && log.enabled,
		);
		if (!channelLogsEnabled) return;

		const logChannelId = dataGD.Webhooks?.[0]?.channelId;
		if (!logChannelId) return;

		const logChannel = await guild.channels
			.fetch(logChannelId)
			.catch(() => null);
		if (!logChannel) return;

		const { target, executor, changes } = auditLogEntry;
		const channelType = target.type;

		if (
			channelType === ChannelType.GuildText ||
			channelType === ChannelType.GuildVoice
		) {
			const channelCreateEmbed = new EmbedBuilder()
				.setTitle(`Channel Created: ${target.name}`)
				.addFields(
					{ name: "Channel", value: `${target} (${target.id})` },
					{
						name: "Type",
						value: `${
							channelType === ChannelType.GuildText ? "Text" : "Voice"
						}`,
					},
					{ name: "Creator", value: `${executor} (${executor.globalName})` },
					{ name: "ID", value: `${executor.id}` },
				)
				.setColor(mConfig.embedColorSuccess)
				.setTimestamp();

			const channel = await guild.channels.fetch(target.id);

			const permissionsArray = [];
			const rolePermissions = [];

			// Direct permissions
			for (const overwrite of channel.permissionOverwrites.cache.values()) {
				if (overwrite.type === "member") {
					const permissions = overwrite.allow.toArray();
					for (const permission of permissions) {
						const permissionName = PermissionFlagsBits[permission]
							.replace(/_/g, " ")
							.toLowerCase();
						permissionsArray.push(`${permissionName}`);
					}
				}
			}

			if (permissionsArray.length > 0) {
				channelCreateEmbed.addFields({
					name: "Direct Permissions",
					value: permissionsArray.join(", "),
				});
			}

			// Role permissions
			for (const overwrite of channel.permissionOverwrites.cache.values()) {
				if (overwrite.type === "role") {
					const role = guild.roles.cache.get(overwrite.id);
					if (role) {
						const rolePermissionsArray = [];
						const permissions = overwrite.allow.toArray();
						for (const permission of permissions) {
							const permissionName = PermissionFlagsBits[permission]
								.replace(/_/g, " ")
								.toLowerCase();
							rolePermissionsArray.push(`${permissionName}`);
						}
						rolePermissions.push(
							`**${role.name}:** ${rolePermissionsArray.join(", ")}`,
						);
					}
				}
			}

			if (rolePermissions.length > 0) {
				channelCreateEmbed.addFields({
					name: "Role Permissions",
					value: rolePermissions.join("\n"),
				});
			}

			logChannel.send({ embeds: [channelCreateEmbed] });
		}
	} catch (error) {
		console.log(error);
	}
};
