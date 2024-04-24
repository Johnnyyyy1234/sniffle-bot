const {
	SlashCommandBuilder,
	PermissionFlagsBits,
	ChannelType,
	ActionRowBuilder,
	StringSelectMenuBuilder,
} = require("discord.js");
const ticketPanelSetup = require("../../schemas/ticketPanelSetup");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("add-menu")
		.setDescription("Add a menu to a ticket panel.")
		.addStringOption((option) =>
			option
				.setName("panel_name")
				.setDescription("The name or identifier of the ticket panel.")
				.setRequired(true),
		)
		.addStringOption((option) =>
			option
				.setName("placeholder")
				.setDescription("The placeholder text for the menu.")
				.setRequired(true),
		)
		.addStringOption((option) =>
			option
				.setName("option_label")
				.setDescription("The label for the menu option.")
				.setRequired(true),
		)
		.addChannelOption((option) =>
			option
				.setName("target_channel")
				.setDescription("The channel where the ticket will be created.")
				.setRequired(true)
				.addChannelTypes(ChannelType.GuildText),
		)
		.addRoleOption((option) =>
			option
				.setName("role")
				.setDescription(
					"The role to assign to the user when the option is selected.",
				),
		)
		.toJSON(),

	userPermissions: [PermissionFlagsBits.Administrator],
	botPermissions: [],
	devOnly: true,
	run: async (client, interaction) => {
		try {
			return interaction.reply({content: "This command is not ready yet."})
			const panelName = interaction.options.getString("panel_name");
			const placeholder = interaction.options.getString("placeholder");
			const optionLabel = interaction.options.getString("option_label");
			const targetChannel = interaction.options.getChannel("target_channel");
			const role = interaction.options.getRole("role");

			const optionValue = optionLabel.toLowerCase().replace(/\s+/g, "_");
			const customID = `${placeholder
				.toLowerCase()
				.replace(/\s+/g, "_")}_${Math.floor(Math.random() * 1000)}`;

			const menu = new StringSelectMenuBuilder()
				.setCustomId(customID)
				.setPlaceholder(placeholder)
				.setMinValues(1)
				.setMaxValues(1)
				.addOptions([
					{
						label: optionLabel,
						value: optionValue,
					},
				]);

			const updatedPanel = await ticketPanelSetup.findOneAndUpdate(
				{ panelName: panelName, guildID: interaction.guild.id },
				{
					$push: {
						menus: {
							customID: customID,
							placeholder: placeholder,
							minValues: 1,
							maxValues: 1,
							options: [
								{
									label: optionLabel,
									value: optionValue,
									targetChannel: targetChannel.id,
									role: role ? role.id : null,
								},
							],
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

			const actionRow = new ActionRowBuilder().addComponents(menu);

			await message.edit({ components: [actionRow] });

			await interaction.reply({
				content: "Menu added to the ticket panel successfully!",
				ephemeral: true,
			});
		} catch (error) {
			console.log(error);
			await interaction.reply({
				content: "An error occurred while adding the menu to the ticket panel.",
				ephemeral: true,
			});
		}
	},
};
