const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const User = require("../../schemas/levels");
const errorHandler = require("../../utils/errorHandler");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("leaderboard")
		.setDescription("Displays the XP leaderboard of this server.")
		.toJSON(),
	userPermissions: [],
	botPermissions: [],

	run: async (client, interaction) => {
		try {
			const users = await User.find({ GuildID: interaction.guild.id })
				.sort({ Level: -1, Xp: -1 })
				.limit(10);

			let leaderboardDescription = "";
			for (let position = 0; position < users.length; position++) {
				const user = users[position];
				const member = await interaction.guild.members.fetch(user.UserID);
				leaderboardDescription += `${position + 1}. <@${
					member ? member.user.id : "Unknown User"
				}> - **Level: ${user.Level} | XP: ${user.Xp}**\n`;
			}

			if (users.length) {
				const leaderboardEmbed = new EmbedBuilder()
					.setTitle(`📊 XP Leaderboard: ${interaction.guild.name}`)
					.setColor("#FFFFFF")
					.setDescription(`${leaderboardDescription}`)
					.setThumbnail(interaction.guild.iconURL({ dynamic: true }));

				interaction.reply({ embeds: [leaderboardEmbed] });
			} else {
				const noLeaderboardEmbed = new EmbedBuilder()
					.setTitle(`📊 XP Leaderboard: ${interaction.guild.name}`)
					.setColor("#FFFFFF")
					.setDescription("*There is currently no leaderboard available.*");

				interaction.reply({ embeds: [noLeaderboardEmbed] });
			}
		} catch (error) {
			console.log(error);
		}
	},
};
