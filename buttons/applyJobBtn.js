const {
	TextInputBuilder,
	TextInputStyle,
	ActionRowBuilder,
	ModalBuilder,
} = require("discord.js");

module.exports = {
	customId: "applyJobBtn",
	userPermissions: [],
	botPermissions: [],

	run: async (client, interaction) => {
		const modal = new ModalBuilder()
			.setCustomId("applyJobMdl")
			.setTitle(`Job Application for ${interaction.guild.name}`)
			.setComponents(
				new ActionRowBuilder().setComponents(
					new TextInputBuilder()
						.setCustomId("applyNameTxI")
						.setLabel("Preferred Name")
						.setStyle(TextInputStyle.Short)
						.setPlaceholder("Silent")
						.setRequired(true),
				),
				new ActionRowBuilder().setComponents(
					new TextInputBuilder()
						.setCustomId("applyAboutMeTxI")
						.setLabel("About Me")
						.setStyle(TextInputStyle.Paragraph)
						.setPlaceholder("I'm a developer...")
						.setRequired(true),
				),
				new ActionRowBuilder().setComponents(
					new TextInputBuilder()
						.setCustomId("applySkillsTxI")
						.setLabel("Skills")
						.setStyle(TextInputStyle.Paragraph)
						.setPlaceholder("I'm skilled in Node.js...")
						.setRequired(true),
				),
				new ActionRowBuilder().setComponents(
					new TextInputBuilder()
						.setCustomId("applyTimezoneTxI")
						.setLabel("Timezone & Availability")
						.setStyle(TextInputStyle.Short)
						.setPlaceholder(
							"My timezone is x. I am available on x, y, and z, at x...",
						)
						.setRequired(true),
				),
				new ActionRowBuilder().setComponents(
					new TextInputBuilder()
						.setCustomId("applyContactTxI")
						.setLabel("Contact")
						.setStyle(TextInputStyle.Short)
						.setPlaceholder("Discord user: @user | Email: example@example.com")
						.setRequired(true),
				),
			);

		await interaction.showModal(modal);
	},
};
