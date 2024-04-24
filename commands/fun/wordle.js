const { Wordle } = require("discord-gamecord");
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("wordle")
        .setDescription("Start a wordle game"),
    deleted: false,
    run: async (client, interaction) => {
        const Game = new Wordle({
            message: interaction,
            isSlashGame: true,
            embed: {
                title: "Wordle",
                color: "#5865F2",
            },
            customWord: null,
            timeoutTime: 60000,
            winMessage: "You won! The word was **{word}**.",
            loseMessage: "You lost! The word was **{word}**.",
            playerOnlyMessage: "Only {player} can use these buttons.",
        });

        Game.startGame();
        Game.on("gameover", (result) => {
            return;
        });
    },
};
