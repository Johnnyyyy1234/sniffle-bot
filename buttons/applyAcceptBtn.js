const {
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	PermissionFlagsBits,
} = require("discord.js");
const jobsSchema = require("../schemas/jobs");
const mConfig = require("../messageConfig.json");

module.exports = {
	customId: "applyAcceptBtn",
	userPermissions: [PermissionFlagsBits.Administrator],
	botPermissions: [],

	run: async (client, interaction) => {
		const { message, user, guildId } = interaction;

		try {
			const savedID = message.id;

			const jobUser = await jobsSchema.findOne({
				"Jobs.Users.savedId": saveID,
			});
			if (!jobUser || !jobUser.jobs || jobUser.Jobs.length === 0)
				return interaction.reply({
					content: "No jobs found!",
					ephermeral: true,
				});

			const matchingJobs = jobUser.jobs.find((job) =>
				job.Users.some((user) => user.savedID === savedID),
			);
			if (matchingJobs.length === 0)
				return interaction.reply({
					content: "No matching job was found!",
					ephermeral: true,
				});

			const schema = await jobsSchema.findOne({ GuildID: guildId });
			const userInJob = matchingJobs.Users.find(
				(user) => user.savedID === savedID,
			);
			if (!userInJob || !userInJob.UserID)
				return interaction.reply({
					content: "Could not find the user information for this interaction.",
					ephermeral: true,
				});

			const targetUser = client.user.cache.get(userInJob.UserID);
			const jobMessageID = matchingJobs.MessageID;
			const messageToEdit = await client.channels.cache
				.get(schema.LogChannel)
				.messages.fetch(savedId);

			const embed = new EmbedBuilder()
				.setTitle("Response")
				.setColor(mConfig.embedColorSuccess)
				.setDescription(
					`Response from <@${user.id}> for job https://discord.com/channels/${guildId}/${schema.LogChannel}/${jobMessageID}`,
				)
				.addFields({
					name: "Response",
					value:
						"Congratulations 🎉 Your application was accepted! Please wait for further instructions.",
				});

			userInJob.Status = "Accepted";
			await jobUser.save().catch((err) => console.log(err));

			await messageToEdit.edit({
				content: "Status: `Accepted`",
				components: [
					new ActionRowBuilder().addComponents(
						new ButtonBuilder()
							.setCustomId("-")
							.setStyle(ButtonStyle.Success)
							.setLabel("Accept")
							.setDisabled(true),
						new ButtonBuilder()
							.setCustomId("-")
							.setStyle(ButtonStyle.Danger)
							.setLabel("Deny")
							.setDisabled(true),
					),
				],
			});

			const sentDM = await targetUser.send({ embeds: [embed] }).catch(() => {
				return interaction.reply({
					content: "Could not send the user a DM...",
					ephermeral: true,
				});
			});

			if (sentDM)
				await interaction.reply({
					content: "Sent the response!",
					ephermeral: true,
				});
		} catch (error) {
			console.log(error);
		}
	},
};
