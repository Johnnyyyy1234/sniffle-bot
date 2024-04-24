const { Slots } = require("discord-gamecord");
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("slot-machine")
		.setDescription("Try your luck with the slot machine."),
	deleted: false,
	run: async (client, interaction) => {
		const Game = new Slots({
			message: interaction,
			isSlashGame: true,
			embed: {
				title: "Slot Machine",
				color: "#5865F2",
			},
			slots: ["🍇", "🍊", "🍋", "🍌"],
		});

		Game.startGame();
		Game.on("gameover", (result) => {
			return;
		});
	},
};
