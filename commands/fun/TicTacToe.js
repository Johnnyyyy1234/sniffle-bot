const { TicTacToe } = require("discord-gamecord");
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("tic-tac-toe")
		.setDescription("Start a tic-tac-toe game with a friend !")
		.addUserOption((option) =>
			option
				.setName("user")
				.setDescription("Pick your opponent to play with.")
				.setRequired(true),
		),
	run: async (client, interaction) => {
		const Game = new TicTacToe({
			message: interaction,
			isSlash: true,
			opponent: interaction.options.getUser("user"),
			embed: {
				title: "Tic Tac Toe",
				color: "#575757",
				statusTitle: "Status",
				overTitle: "Game Over !",
			},
			emojis: {
				xButton: "❌",
				oButton: "⭕",
				blankButton: "➖",
			},
			mentionUser: true,
			timeoutTime: 60000,
			xButtonStyle: "DANGER",
			oButtontStyle: "PRIMARY",
			turnMessage: "{emoji} | it's turn of **{player}**",
			winMessage: "{emoji} | **{player}** won the game !",
			tieMessage: "The Game tied! No one won the Game!",
			timeoutMessage: "The Game went unfinished! No one won the Game!",
			playerOnlyMessage: "Only {player} and {opponent} can use these buttons.",
		});

		Game.startGame();
		Game.on("gameover", (result) => {
			return;
		});
	},
};
