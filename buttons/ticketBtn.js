const ticketSystem = require("../schemas/ticketPanelSetup");

module.exports = {
	customId: async (interaction) => {
		try {
			// Fetch the button data from the database based on the interaction's customId
			const buttonData = await ticketSystem.findOne({
				"buttons.customID": interaction.customId,
			});

			if (!buttonData) {
				// Button data not found in the database
				return null;
			}

			// Access the button data from the fetched document
			const buttonConfig = buttonData.buttons.find(
				(btn) => btn.customID === interaction.customId,
			);

			// Return the customId from the database
			return buttonConfig.customID;
		} catch (error) {
			console.error("Error retrieving button data:", error);
			return null;
		}
	},
	userPermissions: [],
	botPermissions: [],
	devOnly: true,

	run: async (client, interaction) => {
		try {
			// Fetch the button data from the database based on the interaction's customId
			const buttonData = await ticketSystem.findOne({
				"buttons.customID": interaction.customId,
			});

			if (!buttonData) {
				// Button data not found in the database
				return interaction.reply({
					content: "Button data not found.",
					ephemeral: true,
				});
			}

			// Access the button data from the fetched document
			const buttonConfig = buttonData.buttons.find(
				(btn) => btn.customID === interaction.customId,
			);

			// Get the target channel from the button data
			const targetChannel = interaction.guild.channels.cache.get(
				buttonConfig.targetChannel,
			);

			if (!targetChannel) {
				// Target channel not found
				return interaction.reply({
					content: "Target channel not found.",
					ephemeral: true,
				});
			}

			// Create a private thread in the target channel
			const thread = await targetChannel.threads.create({
				name: "Example",
				autoArchiveDuration: 60,
				reason: "Ticket created",
			});

			// Mention the roles if specified in the button data
			if (buttonConfig.roles && buttonConfig.roles.length > 0) {
				const mentionRoles = buttonConfig.roles
					.map((roleId) => {
						const role = interaction.guild.roles.cache.get(roleId);
						return role ? `<@&${roleId}>` : "";
					})
					.join(" ");

				await thread.send(mentionRoles);
			}

			// Reply to the interaction
			await interaction.reply({
				content: `Ticket created in ${thread}`,
				ephemeral: true,
			});
		} catch (error) {
			console.error("Error creating ticket:", error);
			await interaction.reply({
				content: "An error occurred while creating the ticket.",
				ephemeral: true,
			});
		}
	},
};
