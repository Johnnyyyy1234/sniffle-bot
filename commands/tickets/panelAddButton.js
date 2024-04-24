const {
	SlashCommandBuilder,
	PermissionFlagsBits,
	ChannelType,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
} = require("discord.js");
const ticketPanelSetup = require("../../schemas/ticketPanelSetup");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("panel-add-button")
		.setDescription("Add a button to a ticket panel.")
		.addStringOption((option) =>
			option
				.setName("panel_name")
				.setDescription("The name or identifier of the ticket panel.")
				.setRequired(true),
		)
		.addStringOption((option) =>
			option
				.setName("button_label")
				.setDescription("The label or text for the button.")
				.setRequired(true),
		)
		.addChannelOption((option) =>
			option
				.setName("target_channel")
				.setDescription("The channel where the ticket will be created.")
				.setRequired(true)
				.addChannelTypes(ChannelType.GuildText),
		)
		.addStringOption((option) =>
			option
				.setName("button_emoji")
				.setDescription("An emoji to include on the button."),
		)
		.addStringOption((option) =>
			option
				.setName("roles")
				.setDescription(
					"The roles to ping inside the ticket (e.g., @role, @role2, @role3).",
				),
		)
		.addStringOption((option) =>
			option
				.setName("style")
				.setDescription("The style of the button.")
				.addChoices(
					{ name: "Primary", value: "Primary" },
					{ name: "Secondary", value: "Secondary" },
					{ name: "Success", value: "Success" },
					{ name: "Danger", value: "Danger" },
				),
		)
		.toJSON(),

	userPermissions: [PermissionFlagsBits.Administrator],
	botPermissions: [],
	devOnly: true,
	run: async (client, interaction) => {
		try {
			const panelName = interaction.options.getString("panel_name");
			const buttonLabel = interaction.options.getString("button_label");
			const buttonEmoji = interaction.options.getString("button_emoji");
			const targetChannel = interaction.options.getChannel("target_channel");
			const rolesInput = interaction.options.getString("roles");
			const style = interaction.options.getString("style") || "Secondary";

			const roles = rolesInput
				? rolesInput.split(",").map((role) => role.trim())
				: [];

			const customID = `${buttonLabel
				.toLowerCase()
				.replace(/\s+/g, "_")}_${Math.floor(Math.random() * 1000)}`;

			const button = new ButtonBuilder()
				.setCustomId(customID)
				.setLabel(buttonLabel)
				.setStyle(ButtonStyle[style]);

			if (buttonEmoji) {
				button.setEmoji(buttonEmoji);
			}

			const updatedPanel = await ticketPanelSetup.findOneAndUpdate(
				{ panelName: panelName, guildID: interaction.guild.id },
				{
					$push: {
						buttons: {
							buttonLabel: buttonLabel,
							buttonEmoji: buttonEmoji,
							targetChannel: targetChannel.id,
							roles: roles,
							style: style,
							customID: customID,
						},
					},
				},
				{ new: true },
			);

			if (!updatedPanel) {
				return interaction.reply({
					content: "The specified ticket panel does not exist.",
					ephemeral: true,
				});
			}

			const channel = await client.channels.fetch(updatedPanel.channelID);
			if (!channel) {
				return interaction.reply({
					content:
						"The channel associated with the ticket panel no longer exists.",
					ephemeral: true,
				});
			}

			const message = await channel.messages.fetch(updatedPanel.messageID);
			if (!message) {
				return interaction.reply({
					content:
						"The message associated with the ticket panel no longer exists.",
					ephemeral: true,
				});
			}

			const actionRow = message.components[0]
				? ActionRowBuilder.from(message.components[0])
				: new ActionRowBuilder();
			actionRow.addComponents(button);

			await message.edit({ components: [actionRow] });

			await interaction.reply({
				content: "Button added to the ticket panel successfully!",
				ephemeral: true,
			});
		} catch (error) {
			console.log(error);
			await interaction.reply({
				content:
					"An error occurred while adding the button to the ticket panel.",
				ephemeral: true,
			});
		}
	},
};
