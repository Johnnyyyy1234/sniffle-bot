const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");
const countingSchema = require("../../schemas/countingSchema");
const errorHandler = require("../../utils/errorHandler");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("counting-ban")
		.setDescription("Ban a member from counting")
		.setDMPermission(false)
		.addUserOption((option) =>
			option
				.setName("member")
				.setDescription("Please indicate the member you would like to ban.")
				.setRequired(true),
		)
		.toJSON(),
	botPermissions: [PermissionsBitField.ManageChannels],
	userPermissions: [PermissionsBitField.ManageChannels],

	run: async (client, interaction) => {
		try {
			const member = interaction.options.getUser("member");
			const existingData = await countingSchema.findOne({
				Guild: interaction.guild.id,
			});

			if (!hasPermissions(interaction.member) || !existingData) {
				return await replyWithError(interaction, member, existingData);
			}

			const countingChannel = await getCountingChannel(
				interaction.guild,
				existingData.Channel,
			);
			if (!countingChannel) {
				return await interaction.reply({
					content: "The counting channel seems to be missing.",
					ephemeral: true,
				});
			}

			await banMemberFromCounting(countingChannel, member);

			await interaction.reply({
				content: `${member} has been banned from counting!`,
				ephemeral: true,
			});
		} catch (error) {
			console.log(error);
			await interaction.reply({
				content: "Oops! Something went wrong while banning the member.",
				ephemeral: true,
			});
		}
	},
};

function hasPermissions(member) {
	return member.permissions.has(PermissionsBitField.Flags.ManageChannels);
}

async function replyWithError(interaction, member, existingData) {
	if (!hasPermissions(interaction.member)) {
		await interaction.reply({
			content: "You have no power here.",
			ephemeral: true,
		});
	} else if (!existingData) {
		await interaction.reply({
			content: "I can't ban anyone if the counting system has not been setup!",
			ephemeral: true,
		});
	}
}

async function getCountingChannel(guild, channelId) {
	return guild.channels.cache.get(channelId);
}

async function banMemberFromCounting(countingChannel, member) {
	await countingChannel.permissionOverwrites.create(member, {
		ViewChannel: true,
		SendMessages: false,
	});

	await countingChannel.send(`${member} has been banned from counting.`);
}
