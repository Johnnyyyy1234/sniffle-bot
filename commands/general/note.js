const {
	SlashCommandBuilder,
	EmbedBuilder,
	Client,
	ChatInputCommandInteraction,
} = require("discord.js");
const UserSchema = require("../../schemas/notes");
const random = require("randomized-string");
module.exports = {
	data: new SlashCommandBuilder()
		.setName("note")
		.setDescription("Add a note to a user.")
		.addUserOption((option) =>
			option
				.setName("user")
				.setDescription("The user to add a note to.")
				.setRequired(true),
		)
		.addStringOption((option) =>
			option
				.setName("note")
				.setDescription("The note to add to the user.")
				.setRequired(true),
		)
		.toJSON(),
	botPermissions: [],
	userPermissions: [],
	/**
	 *
	 * @param {Client} client
	 * @param {ChatInputCommandInteraction} interaction
	 */
	run: async (client, interaction) => {
		const user = interaction.options.getUser("user");
		const note = interaction.options.getString("note");
		const data = await UserSchema.findOne({
			GuildID: interaction.guild.id,
			UserID: user.id,
		});
		if (!data) {
			const newData = new UserSchema({
				GuildID: interaction.guild.id,
				UserID: user.id,
				Notes: [
					{
						Note: note,
						Moderator: interaction.user.id,
						CreatedAt: new Date().getTime(),
						ID: random.generate({ length: 10, charset: "alphabetic" }),
					},
				],
			});
			newData.save();
			return interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setDescription(`\`✅\` Note added for ${user.tag}.`)
						.setColor("Green"),
				],
			});
		}
		data.Notes.push({
			Note: note,
			Moderator: interaction.user.id,
			CreatedAt: new Date().getTime(),
			ID: random.generate({ length: 10, charset: "alphabetic" }),
		});
		data.save();
		return interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setDescription(`\`✅\` Note added for ${user.tag}.`)
					.setColor("Green"),
			],
		});
	},
};
