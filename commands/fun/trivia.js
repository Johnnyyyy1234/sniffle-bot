const { Trivia } = require("discord-gamecord");
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("trivia")
		.setDescription("Start a trivia game")
		.addStringOption((option) =>
			option
				.setName("difficulty")
				.setDescription("Select the difficulty level")
				.setRequired(true)
				.addChoices(
					{ name: "Easy", value: "easy" },
					{ name: "Medium", value: "medium" },
					{ name: "Hard", value: "hard" },
				),
		),
	deleted: false,
	run: async (client, interaction) => {
		const difficulty = interaction.options.getString("difficulty");
		const Game = new Trivia({
			message: interaction,
			isSlashGame: true,
			embed: {
				title: "Trivia",
				color: "#5865F2",
				description: "You have 60 seconds to guess the answer.",
			},
			timeoutTime: 60000,
			buttonStyle: "PRIMARY",
			trueButtonStyle: "SUCCESS",
			falseButtonStyle: "DANGER",
			mode: "multiple", // multiple || single
			difficulty: difficulty,
			winMessage: "You won! The correct answer is {answer}.",
			loseMessage: "You lost! The correct answer is {answer}.",
			errMessage: "Unable to fetch question data! Please try again.",
			playerOnlyMessage: "Only {player} can use these buttons.",
		});

		Game.startGame();
		Game.on("gameover", (result) => {
			return;
		});
	},
};
