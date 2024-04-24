const {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	Client,
} = require("discord.js");
const giveawaySchema = require("../../schemas/giveaways");
const shuffledParticipants = require("./shuffleParticipants");

/**
 * @param {Client} client
 */

module.exports = async (client) => {
	try {
		const giveaways = await giveawaySchema.find({});

		for (const giveaway of giveaways) {
			const now = new Date().getTime();

			if (now >= giveaway.EndTimestamp) {
				const channel = client.channels.cache.get(giveaway.ChannelID);
				const message = await client.channels
					.fetch(giveaway.MessageID)
					.catch(() => {
						return;
					});

				const row = new ActionRowBuilder().addComponents(
					new ButtonBuilder()
						.setCustomId("-")
						.setLabel("🎉")
						.setDisabled(true)
						.setStyle(ButtonStyle.Primary),
				);

				let shuffledParticipants = shuffledParticipants(
					giveaway.Participants.slice(),
				);
				const winners = shuffledParticipants.slice(0, giveaway.WinnerCount);

				if (!winners.length) {
					if (giveaway.Ended === true) return;
					if (giveaway.Paused === true) return;

					const embed = new EmbedBuilder()
						.setTitle("🔴")
						.setDescription(
							`This giveaway ended <t:${Math.floor(
								giveaway.EndTimestamp / 1000,
							)}:R>`,
						)
						.addFields(
							{
								name: "🎟️ Entries",
								value: `${giveaway.Participants.length}`,
								inline: true,
							},
							{
								name: "🏆 Winners",
								value: "*No one entered the giveaway*",
								inline: true,
							},
						)
						.setColor("White");
					const endMessage = await message.edit({
						embeds: [embed],
						components: [row],
					});

					endMessage.reply("*Giveaway ended, but no one joined the giveaway.*");

					giveaway.Ended = true;
					await giveaway.save().catch((error) => console.log(error));
				} else {
					if (giveaway.Ended === true) return;
					if (giveaway.Paused === true) return;

					const mentions = winners.map((winner) => `<@${winner}>`).join(", ");

					const embed = new EmbedBuilder()
						.setTitle("🔴")
						.setDescription(
							`This giveaway ended <t:${Math.floor(
								giveaway.EndTimestamp / 1000,
							)}:R>`,
						)
						.addFields(
							{
								name: "🎟️ Entries",
								value: `${giveaway.Participants.length}`,
								inline: true,
							},
							{
								name: "🏆 Winners",
								value: `${mentions}`,
								inline: true,
							},
						)
						.setColor("White");
					const endMessage = await message.edit({
						embeds: [embed],
						components: [row],
					});

					endMessage.reply({
						content: `Congratulations ${mentions}! You won the **${giveaway.Prize}** giveaway!`,
					});

					giveaway.Ended = true;
					await giveaway.save().catch((error) => console.log(error));
				}
			}
		}
	} catch (error) {
		console.log(error);
	}
};
