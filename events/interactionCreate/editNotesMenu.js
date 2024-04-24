const {
	StringSelectMenuInteraction,
	EmbedBuilder,
	Client,
	ModalBuilder,
	ActionRowBuilder,
	TextInputBuilder,
	TextInputStyle,
} = require("discord.js");
const UserSchema = require("../../schemas/notes");

module.exports = async (client, interaction) => {
	/**
	 * @param {StringSelectMenuInteraction} interaction
	 * @param {Client} client
	 */
	if (!interaction.isStringSelectMenu()) return;
	if (!interaction.customId.endsWith("-edit-note-select")) return;
	if (!interaction.memberPermissions.has("Administrator"))
		return interaction.reply({
			content: "You do not have permission to use this menu.",
			ephemeral: true,
		});
	const user = interaction.customId.split("-")[0];
	const user2 = await client.users.cache.get(user);
	const data = await UserSchema.findOne({
		GuildID: interaction.guild.id,
		UserID: user,
	});
	if (!data) {
		return interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setDescription(`\`❌\` No notes found for ${user2.username}`)
					.setColor("Red"),
			],
			ephemeral: true,
		});
	}
	if (data && data.Notes.length === 0) {
		return interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setDescription(`\`❌\` No notes found for ${user2.username}`)
					.setColor("Red"),
			],
			ephemeral: true,
		});
	}
	const note = data.Notes.find((note) => note.ID === interaction.values[0]);
	if (!note) {
		return interaction.reply({
			content: `\`❌\` No note found with the ID \`${interaction.values[0]}\` for <@${user}>.`,
			ephemeral: true,
		});
	}
	const modal = new ModalBuilder()
		.setCustomId(`${note.ID}-edit-note-modal`)
		.setTitle(`Editing note for ${user2.username}`);
	const row = new ActionRowBuilder().addComponents(
		new TextInputBuilder()
			.setCustomId(`${note.ID}-edit-note`)
			.setLabel("Edit the note.")
			.setStyle(TextInputStyle.Paragraph)
			.setPlaceholder("Edit the note."),
	);
	modal.addComponents(row);
	await interaction.showModal(modal);
	const res = await interaction.awaitModalSubmit({
		filter: (i) => i.customId === `${note.ID}-edit-note-modal`,
		time: 60_000,
	});
	if (res) {
		try {
			note.Note = res.fields.getTextInputValue(`${note.ID}-edit-note`);
			console.log(res.fields.getTextInputValue(`${note.ID}-edit-note`));
			data.save();
			res.reply({
				embeds: [
					new EmbedBuilder()
						.setDescription(`\`✅\` Edited note for ${user2.username}`)
						.setColor("Green"),
				],
				ephemeral: true,
			});
		} catch (err) {
			console.log(err);
		}
	}
};
