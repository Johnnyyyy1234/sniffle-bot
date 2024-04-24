const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("giveaway")
		.setDescription("Giveaway command.")
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	userPermissions: [PermissionFlagsBits.Administrator],
	botPermissions: [],
	devOnly: true,
	run: async (client, interaction) => {
		return;
	},
};
