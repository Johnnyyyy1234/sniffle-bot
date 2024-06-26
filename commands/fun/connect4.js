const { Connect4 } = require("discord-gamecord");
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("connect4")
		.setDescription("Start a connect4 game with a friend !")
		.addUserOption((option) =>
			option
				.setName("user")
				.setDescription("Pick your opponent to play with.")
				.setRequired(true),
		),
	run: async (client, interaction) => {
		const Game = new Connect4({
			message: interaction,
			isSlashGame: true,
			opponent: interaction.options.getUser("user"),
			embed: {
				title: "Connect4 Game",
				statusTitle: "Status",
				color: "#5865F2",
			},
			emojis: {
				board: "⚪",
				player1: "🔴",
				player2: "🟡",
			},
			mentionUser: true,
			timeoutTime: 60000,
			buttonStyle: "PRIMARY",
			turnMessage: "{emoji} | Its turn of player **{player}**.",
			winMessage: "{emoji} | **{player}** won the Connect4 Game.",
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
