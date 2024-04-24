const {
	SlashCommandBuilder,
	EmbedBuilder,
	time,
	discordSort,
	Client,
	ChatInputCommandInteraction,
} = require("discord.js");
const packageJson = require("../../package.json");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("info")
		.setDescription("Get information about the bot")
		.addSubcommand((s) =>
			s.setName("bot").setDescription("Get information about the bot."),
		)
		.addSubcommand((s) =>
			s.setName("server").setDescription("Get information about the server."),
		)
		.addSubcommand((s) =>
			s
				.setName("user")
				.setDescription("Get information about a user.")
				.addUserOption((o) =>
					o
						.setName("target")
						.setDescription("The user to get information about."),
				),
		)
		.toJSON(),
	botPermissions: [],
	userPermissions: [],

	/**
	 *
	 * @param {Client} client
	 * @param {ChatInputCommandInteraction} interaction
	 * @returns
	 */

	run: async (client, interaction) => {
		await interaction.deferReply({ fetchReply: true });

		const { options, guild } = interaction;
		const subcommand = options.getSubcommand();

		const infoEmbed = new EmbedBuilder().setColor("Green");

		switch (subcommand) {
			case "user":
				{
					const user = options.getUser("target") || interaction.user;
					const member = guild.members.cache.get(user.id);

					infoEmbed.setAuthor({
						name: user.tag,
						iconURL: user.displayAvatarURL({ dynamic: true }),
					});
					infoEmbed.addFields(
						{ name: "User ID", value: user.id, inline: true },
						{
							name: "Nickname",
							value: member.nickname || "None",
							inline: true,
						},
						{ name: "Username", value: user.username, inline: true },
						{
							name: "Status",
							value: getStatusText(member.presence.status),
							inline: true,
						},
						{
							name: "Joined Server",
							value: time(member.joinedAt, "R"),
							inline: true,
						},
						{
							name: "Joined Discord",
							value: time(user.createdAt, "R"),
							inline: true,
						},
						{
							name: "Highest Role",
							value:
								discordSort(member.roles.cache).last().toString() ||
								"No highest role",
							inline: true,
						},
					);
					infoEmbed.setThumbnail(user.displayAvatarURL({ dynamic: true }));
				}
				break;

			case "server":
				infoEmbed.setAuthor({
					name: guild.name,
					iconURL: guild.iconURL({ dynamic: true }),
				});
				infoEmbed.addFields(
					{
						name: "Owner",
						value: `<@${guild.ownerId}>`,
						inline: true,
					},
					{ name: "Members", value: `${guild.memberCount}`, inline: true },
					{ name: "Roles", value: `${guild.roles.cache.size}`, inline: true },
					{
						name: "Channels",
						value: `${guild.channels.cache.size}`,
						inline: true,
					},
					{
						name: "Created At",
						value: time(guild.createdAt, "R"),
						inline: true,
					},
					{
						name: "Boosts",
						value: `${guild.premiumSubscriptionCount}`,
						inline: true,
					},
				);
				infoEmbed.setThumbnail(guild.iconURL({ dynamic: true }));
				break;

			case "bot": {
				const uptime = new Date(Date.now() - client.uptime);

				infoEmbed.setAuthor({
					name: client.user.tag,
					iconURL: client.user.displayAvatarURL({ dynamic: true }),
				});
				infoEmbed.addFields(
					{
						name: "Ping",
						value: `${Math.round(client.ws.ping)}ms`,
						inline: true,
					},
					{ name: "Uptime", value: time(uptime, "R"), inline: true },
					{
						name: "Memory Usage",
						value: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(
							2,
						)} MB`,
						inline: true,
					},
					{
						name: "CPU Usage",
						value: `${(process.cpuUsage().system / 1024 / 1024).toFixed(2)}%`,
						inline: true,
					},
					{ name: "Node.js Version", value: process.version, inline: true },
					{
						name: "Discord.js Version",
						value: packageJson.dependencies["discord.js"].substring(1),
						inline: true,
					},
				);
				infoEmbed.setThumbnail(client.user.displayAvatarURL({ dynamic: true }));
			}
		}

		await interaction.editReply({ embeds: [infoEmbed] });
	},
};

function getStatusText(status) {
	switch (status) {
		case "online":
			return "`🟢` Online";
		case "idle":
			return "`🟠` Idle";
		case "dnd":
			return "`🔴` Do Not Disturb";
		case "offline":
			return "`⚫` Offline";
		case "invisible":
			return "`⚪` Invisible";
		default:
			return "Unknown";
	}
}
