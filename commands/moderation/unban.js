const {
	SlashCommandBuilder,
	EmbedBuilder,
	PermissionFlagsBits,
} = require("discord.js");
const mConfig = require("../../messageConfig.json");
const moderationSchema = require("../../schemas/moderation");

async function unbanUserFromGuild(guild, userId, reason) {
	await guild.bans.remove(userId, reason);
}

async function sendModLogMessage(
	client,
	channel,
	user,
	action,
	reason,
	automatic = false,
) {
	const embed = new EmbedBuilder()
		.setColor("FFFFFF")
		.setTitle(`\`${action === "ban" ? "❌" : "⛔"}\` User ${action}ned`)
		.setAuthor({
			name: user.username,
			iconURL: user.displayAvatarURL({ dynamic: true }),
		})
		.setFooter({
			iconURL: client.user.displayAvatarURL({ dynamic: true }),
			text: `${client.user.username} - Logging system`,
		})
		.addFields(
			{
				name: `${action === "ban" ? "Banned" : "Unbanned"} by`,
				value: automatic ? `<@${client.user.id}>` : `<@${user.id}>`,
				inline: true,
			},
			{ name: "Reason", value: reason, inline: true },
		);

	await channel.send({ embeds: [embed] });
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName("unban")
		.setDescription("Unbans a user from the server.")
		.addStringOption((o) =>
			o.setName("id").setDescription("The ID of the user.").setRequired(true),
		)
		.addStringOption((o) =>
			o
				.setName("reason")
				.setDescription("The reason for unbanning this user.")
				.setRequired(false),
		)
		.toJSON(),
	userPermissions: [PermissionFlagsBits.BanMembers],
	botPermissions: [],

	run: async (client, interaction) => {
		try {
			const { options, guildId, guild, member } = interaction;
			const userId = options.getString("id");
			const reason = options.getString("reason") || "No reason provided";

			const bannedUser = await guild.bans.fetch(userId).catch(() => null);

			await interaction.deferReply({ ephemeral: true });

			if (!bannedUser) {
				return interaction.editReply({
					content: `\`❌\` User with ID ${userId} is not banned from this server.`,
				});
			}

			await unbanUserFromGuild(guild, userId, reason);

			await interaction.editReply({
				content: `\`✅\` Successfully unbanned ${bannedUser.user.username}.`,
			});

			const guildData = await moderationSchema.findOne({ GuildID: guildId });
			const logChannel = guild.channels.cache.get(guildData.LogChannelID);
			await sendModLogMessage(
				client,
				logChannel,
				bannedUser.user,
				"unban",
				reason,
			);

			const multiGuildModData = await moderationSchema.find({
				MultiGuilded: true,
			});

			for (const guildMod of multiGuildModData) {
				if (guildMod.GuildID === guildId) continue;

				const externalGuild = client.guilds.cache.get(guildMod.GuildID);

				try {
					await unbanUserFromGuild(
						externalGuild,
						userId,
						"Automatic multi-guilded unban.",
					);

					const externalLogChannel = externalGuild.channels.cache.get(
						guildMod.LogChannelID,
					);
					await sendModLogMessage(
						client,
						externalLogChannel,
						bannedUser.user,
						"unban",
						"Automatic multi-guilded unban.",
						true,
					);
				} catch (error) {
					if (error.code === 10026) {
						// User is not banned in the external guild, skip unbanning
						continue;
					}

					console.error(
						`Failed to unban user ${userId} from guild ${externalGuild.id}:`,
						error,
					);
				}
			}
		} catch (error) {
			console.log(error);
			await interaction.editReply({
				content:
					"An error occurred while processing the unban.",
			});
		}
	},
};
