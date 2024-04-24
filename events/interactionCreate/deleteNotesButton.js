const {
	ButtonInteraction,
	ActionRowBuilder,
	StringSelectMenuBuilder,
	EmbedBuilder,
	Client,
} = require("discord.js");
const UserSchema = require("../../schemas/notes");

module.exports = async (client, interaction) => {
	/**
	 *
	 * @param {ButtonInteraction} interaction
	 * @param {Client} client
	 */
	function formatDate(timestamp) {
		const date = new Date(timestamp);
		const year = date.getFullYear().toString().substr(-2);
		const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are 0-based in JavaScript
		const day = date.getDate().toString().padStart(2, "0");

		return `${month}/${day}/${year}`;
	}
	if (!interaction.isButton()) return;
	if (!interaction.customId.endsWith("-delete-note")) return;
	if (!interaction.memberPermissions.has("Administrator"))
		return interaction.reply({
			content: "You do not have permission to use this button.",
			ephemeral: true,
		});
	try {
		const user = interaction.customId.split("-")[0];
		const user2 = client.users.cache.get(user);
		const data = await UserSchema.findOne({
			GuildID: interaction.guild.id,
			UserID: user,
		});
		if (!data) {
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
				.setCustomId(`${user}-delete-note-select`)
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
						`**${user2.username} has ${data.Notes.length} notes. Select a note to delete.**`,
					)
					.setColor("F04A47"),
			],
			components: [row],
		});
	} catch (error) {
		console.log(error);
	}
};
