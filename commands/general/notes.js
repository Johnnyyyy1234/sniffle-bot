const {
	SlashCommandBuilder,
	ChatInputCommandInteraction,
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
} = require("discord.js");
const UserSchema = require("../../schemas/notes");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("notes")
		.setDescription("View notes for a user.")
		.addUserOption((option) =>
			option
				.setName("user")
				.setDescription("The user to view notes for.")
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
			});
		}
		const notes = data.Notes.map((note, index) => {
			return `**Moderator:** <@${note.Moderator}>\n${
				note.Note
			} - <t:${Math.floor(note.CreatedAt / 1000)}:R>`;
		});
		const row = new ActionRowBuilder().addComponents(
			new ButtonBuilder()
				.setCustomId(`${user.id}-delete-note`)
				.setLabel("Delete a note")
				.setEmoji("🗑️")
				.setStyle(ButtonStyle.Danger),
		);
		return interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setAuthor({
						name: `Notes for ${user.username} (${user.id})`,
						iconURL: user.displayAvatarURL({ forceStatic: false }),
					})
					.setDescription(`${notes.join("\n")}`)
					.setColor("E86B6B"),
			],
			components: [row],
		});
	},
};
