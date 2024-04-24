const {
	SlashCommandBuilder,
	ChatInputCommandInteraction,
	ActionRowBuilder,
	StringSelectMenuBuilder,
	EmbedBuilder,
	Client,
} = require("discord.js");
const UserSchema = require("../../schemas/notes");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("delnote")
		.setDescription("Delete a note for a user.")
		.addUserOption((option) =>
			option
				.setName("user")
				.setDescription("The user to delete a note for.")
				.setRequired(true),
		)
		.toJSON(),
	botPermissions: [],
	userPermissions: [],
	/**
	 * @param {Client} client
	 * @param {ChatInputCommandInteraction} interaction
	 */
	run: async (client, interaction) => {
		function formatDate(timestamp) {
			const date = new Date(timestamp);
			const year = date.getFullYear().toString().substr(-2);
			const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are 0-based in JavaScript
			const day = date.getDate().toString().padStart(2, "0");

			return `${month}/${day}/${year}`;
		}
		const user = interaction.options.getUser("user");
		const data = await UserSchema.findOne({
			GuildID: interaction.guild.id,
			UserID: user.id,
		});
		if (!data || data.Notes.length === 0) {
			return interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setDescription(`\`❌\` No notes found for ${user.tag}.`)
						.setColor("Red"),
				],
				ephemeral: true,
			});
		}
		const row = new ActionRowBuilder().addComponents(
			new StringSelectMenuBuilder()
				.setCustomId(`${user.id}-delete-note-select`)
				.setPlaceholder("Select a note to delete.")
				.addOptions(
					data.Notes.map((note) => {
						return {
							label: `${note.Note} - ${formatDate(note.CreatedAt)}`,
							value: `${note.ID}`,
						};
					}),
				),
		);
		return interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setDescription(
						`**${user.username} has ${data.Notes.length} notes. Select a note to delete.**`,
					)
					.setColor("F04A47"),
			],
			components: [row],
		});
	},
};
