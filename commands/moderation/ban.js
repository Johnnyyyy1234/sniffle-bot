const {
	SlashCommandBuilder,
	EmbedBuilder,
	PermissionFlagsBits,
} = require("discord.js");
const mConfig = require("../../messageConfig.json");
const moderationSchema = require("../../schemas/moderation");

async function banUserFromGuild(guild, userId, reason) {
	await guild.bans.create(userId, {
		deleteMessageSeconds: 60 * 60 * 24 * 7,
		reason,
	});
}

async function sendModLogMessage(
	interaction,
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
		.setDescription(
			`\`💡\` To unban ${user.username}, use \`/unban ${user.id}\` to revoke this ban.`,
		)
		.setFooter({
			iconURL: client.user.displayAvatarURL({ dynamic: true }),
			text: `${client.user.username} - Logging system`,
		})
		.addFields(
			{
				name: `${action === "ban" ? "Banned" : "Unbanned"} by`,
				value: automatic ? `<@${client.user.id}>` : `<@${interaction.user.id}>`,
				inline: true,
			},
			{ name: "Reason", value: reason, inline: true },
		);

	await channel.send({ embeds: [embed] });
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName("ban")
		.setDescription("Bans a user from the server.")
		.addUserOption((o) =>
			o.setName("user").setDescription("The user to ban.").setRequired(true),
		)
		.addStringOption((o) =>
			o
				.setName("reason")
				.setDescription("What is the reason for banning this person?")
				.setRequired(true),
		)
		.toJSON(),
	userPermissions: [PermissionFlagsBits.BanMembers],
	botPermissions: [PermissionFlagsBits.BanMembers],

	run: async (client, interaction) => {
		try {
			const { options, guildId, guild, member } = interaction;
			const user = options.getUser("user");
			const reason = options.getString("reason") || "No reason provided";

			const targetMember = await guild.members.fetch(user.id).catch(() => null);

			await interaction.deferReply({ ephemeral: true });

			if (targetMember) {
				if (targetMember.id === member.id) {
					return interaction.reply({
						content: mConfig.unableToInteractWithYourself,
						ephemeral: true,
					});
				}

				if (
					targetMember.roles.highest.position >= member.roles.highest.position
				) {
					return interaction.reply({
						content: mConfig.hasHigherRolePosition,
						ephemeral: true,
					});
				}
			}

			await banUserFromGuild(guild, user.id, reason);

			const guildData = await moderationSchema.findOne({ GuildID: guildId });
			const logChannel = guild.channels.cache.get(guildData.LogChannelID);
			await sendModLogMessage(
				interaction,
				client,
				logChannel,
				user,
				"ban",
				reason,
			);

			const multiGuildModData = await moderationSchema.find({
				MultiGuilded: true,
			});

			for (const guildMod of multiGuildModData) {
				if (guildMod.GuildID === guildId) continue;

				const externalGuild = client.guilds.cache.get(guildMod.GuildID);
				const externalBot = await externalGuild.members.fetch(client.user.id);

				// Check if the bot has permission to ban in the external guild
				if (externalBot.permissions.has(PermissionFlagsBits.BanMembers)) {
					try {
						await banUserFromGuild(
							externalGuild,
							user.id,
							`${reason} - Automatic multi-guilded ban.`,
						);

						const externalLogChannel = externalGuild.channels.cache.get(
							guildMod.LogChannelID,
						);
						await sendModLogMessage(
							interaction,
							client,
							externalLogChannel,
							user,
							"ban",
							`${reason} - Automatic multi-guilded ban.`,
							true,
						);
					} catch (error) {
						console.error(
							`Failed to ban user ${user.id} from guild ${externalGuild.id}:`,
							error,
						);
					}
				}
			}

			await interaction.editReply({
				content: `\`✅\` Successfully banned ${user.username}.`,
			});
		} catch (error) {
			console.log(error);
			await interaction.editReply({
				content:
					"An error occurred while processing the ban.",
			});
		}
	},
};
