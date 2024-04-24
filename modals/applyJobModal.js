const {
	ActionRowBuilder,
	EmbedBuilder,
	ButtonBuilder,
	ButtonStyle,
} = require("discord.js");
const jobsSchema = require("../schemas/jobs");
const mConfig = require("../messageConfig.json");

module.exports = {
	customId: "applyJobMdl",
	userPermissions: [],
	botPermissions: [],

	run: async (client, interaction) => {
		const { message, guildId, fields, guild, user } = interaction;
		const msgId = message.id;

		const schema = await jobsSchema.findOne({ GuildId: guildId });
		if (!schema)
			return interaction.reply({
				content:
					"This server is not setup yet! Please contact the server admins to fix this issue.",
				ephermeral: true,
			});

		const jobToEdit = schema.Jobs.find((job) => job.MessageID === msgId);

		try {
			const name = fields.getTextInputValue("applyNameTxI");
			const aboutMe = fields.getTextInputValue("applyAboutMeTxI");
			const skills = fields.getTextInputValue("applySkillsTxI");
			const timezone = fields.getTextInputValue("applyTimezoneTxI");
			const contact = fields.getTextInputValue("applyContactTxI");

			const embed = new EmbedBuilder()
				.setTitle(`Job Application for ${guild.name}`)
				.setColor(mConfig.embedColorWarning)
				.setDescription(
					`Sent by <@${user.id}> | For job https://discord.com/channels/${guildId}/${schema.LogChannel}/${msgId}`,
				)
				.addFields(
					{ name: "Preferred Name", value: `${name}` },
					{ name: "About Me", value: `${aboutMe}` },
					{ name: "Skills", value: `${skills}` },
					{ name: "Timezone And Availbility", value: `${timezone}` },
					{ name: "Contact", value: `${contact}` },
				)
				.setTimestamp();

			const row = new ActionRowBuilder().setComponents(
				new ButtonBuilder()
					.setCustomId("applyAcceptBtn")
					.setStyle(ButtonStyle.Success)
					.setLabel("Accept"),
				new ButtonBuilder()
					.setCustomId("applyDenyBtn")
					.setStyle(ButtonStyle.Danger)
					.setLabel("Deny"),
			);

			const logChannel = client.channels.cache.get(schema.LogChannel);
			const msg2 = await logChannel.send({
				embeds: [embed],
				components: [row],
			});
			await msg2.edit({ embeds: [embed.setFooter({ text: `${msg2.id}` })] });

			jobToEdit.Users.push({
				Status: "Pending",
				UserID: user.id,
				jobMessageID: msgId,
				savedID: msg2.id,
			});
			await schema.save().catch((error) => console.log(error));

			interaction.reply({
				content: "Application Submitted Successfully.",
				ephermeral: true,
			});
		} catch (error) {
			console.log(error);
		}
	},
};
