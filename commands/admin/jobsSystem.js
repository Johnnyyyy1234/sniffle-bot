const {
	SlashCommandBuilder,
	EmbedBuilder,
	ChannelType,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	PermissionFlagsBits,
} = require("discord.js");
const jobsSchema = require("../../schemas/jobs");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("job")
		.setDescription("A job system.")
		.toJSON(),
	userPermissions: [PermissionFlagsBits.Administrator],
	botPermissions: [],
	devOnly: true,

	run: async (client, interaction) => {
		return;
		let jobChannel, schema, submissionChannel, row, embed;
		const { options, guildId } = interaction;

		const rEmbed = new EmbedBuilder().setColor("Blurple").setTimestamp(true);

		switch (options.getSubcommand()) {
			case "setup":
				jobChannel = options.getChannel("job-channel").id;
				schema = await jobsSchema.findOne({ GuildID: guildId });
				if (!schema) {
					await jobsSchema.create({
						GuildID: guildId,
						LogChannel: submissionChannel,
						JobChannel: jobChannel,
					});
					rEmbed
						.setDescription("Successfully setup!")
						.addFields({ name: "Job Channel " });
				}
		}
	},
};
