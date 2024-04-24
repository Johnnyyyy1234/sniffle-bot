const {
	EmbedBuilder,
	Client,
	StringSelectMenuInteraction,
} = require("discord.js");
const UserSchema = require("../../schemas/notes");

module.exports = async (client, interaction) => {
	/**
	 *
	 * @param {StringSelectMenuInteraction} interaction
	 * @param {Client} client
	 */
	if (!interaction.isStringSelectMenu()) return;
	if (!interaction.customId.endsWith("-delete-note-select")) return;
	if (!interaction.memberPermissions.has("Administrator"))
		return interaction.reply({
			content: "You do not have permission to use this menu.",
			ephemeral: true,
		});
	try {
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
		const note = data.Notes.find((note) => note.ID === interaction.values[0]);
		if (!note) {
			return interaction.reply({
				content: `\`❌\` No note found with the ID \`${interaction.values[0]}\` for <@${user}>.`,
				ephemeral: true,
			});
		}
		data.Notes = data.Notes.filter((note) => note.ID !== interaction.values[0]);
		data.save();
		return interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setDescription(
						`\`✅\` Deleted note \`${note.Note}\` for ${user2.username}`,
					)
					.setColor("Green"),
			],
			ephemeral: true,
		});
	} catch (error) {
		console.log(error);
	}
};
