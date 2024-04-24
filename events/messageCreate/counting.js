const { EmbedBuilder } = require("discord.js");
const countingSchema = require("../../schemas/countingSchema");
const errorHandler = require("../../utils/errorHandler");

const rateLimit = new Map();

module.exports = async (client, message) => {
	try {
		return;
		const countingData = await countingSchema.findOne({
			Guild: message.guild.id,
		});
		if (!countingData) return;

		if (message.channel.id !== countingData.Channel) return;

		const number = Number.parseInt(message.content);

		if (Number.isNaN(number) || number.toString() !== message.content) return;

		// Check if the user is rate limited
		const userId = message.author.id;
		const now = Date.now();
		const userRateLimit = rateLimit.get(userId);

		if (userRateLimit) {
			if (userRateLimit.count >= 7 && now - userRateLimit.lastMessage < 5000) {
				// User has exceeded the rate limit
				const timeoutDuration = 60000; // 1 minute

				const timeoutEmbed = new EmbedBuilder()
					.setTitle("Timeout")
					.setDescription(
						`${message.author.username}, you have been timed out for 1 minute due to exceeding the message rate limit.`,
					)
					.setColor("Orange")
					.setTimestamp()
					.setFooter({ text: "Timeout" });

				await message.channel.send({ embeds: [timeoutEmbed] });

				setTimeout(() => {
					rateLimit.delete(userId);
				}, timeoutDuration);

				return;
			}

			userRateLimit.count++;
			userRateLimit.lastMessage = now;
		} else {
			rateLimit.set(userId, { count: 1, lastMessage: now });
		}

		if (countingData.Count === 0) {
			if (number !== 1) {
				const errorEmbed = new EmbedBuilder()
					.setTitle("Incorrect Number")
					.setDescription(
						"You must type 1 before continuing onto other numbers.",
					)
					.setTimestamp()
					.setFooter({ text: "Incorrect Number At" })
					.setColor("Red");

				await message.channel.send({ embeds: [errorEmbed] });
				return;
			}
		}

		if (number === countingData.Count + 1) {
			countingData.Count++;
			await countingData.save();

			const response = new EmbedBuilder()
				.setTitle(`Current number: ${countingData.Count}`)
				.setColor("Green");

			const reaction = await message.channel.send({ embeds: [response] });
			//await reaction.react(':white_check_mark:');

			// Check if the quarter goal has been reached
			if (countingData.Count === Math.floor(countingData.MaxCount / 4)) {
				const quarterGoalEmbed = new EmbedBuilder()
					.setTitle("Quarter Goal Reached!")
					.setDescription(
						`You have reached a quarter of the goal. Keep going! Only ${
							countingData.MaxCount - countingData.Count
						} numbers left!`,
					)
					.setTimestamp()
					.setFooter({ text: "Quarter Goal Reached" })
					.setColor("Blue");

				await message.channel.send({ embeds: [quarterGoalEmbed] });
			}

			// Check if the halfway goal has been reached
			if (countingData.Count === Math.floor(countingData.MaxCount / 2)) {
				const halfwayGoalEmbed = new EmbedBuilder()
					.setTitle("Halfway Goal Reached!")
					.setDescription(
						`You are halfway to the goal. ${
							countingData.MaxCount - countingData.Count
						} numbers left to reach the goal!`,
					)
					.setTimestamp()
					.setFooter({ text: "Halfway Goal Reached" })
					.setColor("Purple");

				await message.channel.send({ embeds: [halfwayGoalEmbed] });
			}

			// Check if the maximum count has been reached
			if (countingData.Count === countingData.MaxCount) {
				const congratulationsEmbed = new EmbedBuilder()
					.setTitle("Congratulations!")
					.setDescription(
						`${message.author.username}, you have reached the goal of **${countingData.MaxCount}**! Well done!`,
					)
					.setTimestamp()
					.setFooter({ text: "Game Complete" })
					.setColor("Gold");

				const congratsReact = await message.channel.send({
					embeds: [congratulationsEmbed],
				});
				congratsReact.react("🏆");

				countingData.Count = 0;
				await countingData.save();
			}
		} else {
			const wrongNumberEmbed = new EmbedBuilder()
				.setTitle("Wrong Number")
				.setDescription(
					`${message.author.username} has ruined the fun at number **${countingData.Count}**.`,
				)
				.setColor("Red")
				.setTimestamp()
				.setFooter({ text: "Wrong Number" });

			await message.channel.send({ embeds: [wrongNumberEmbed] });

			countingData.Count = 0;
			await countingData.save();
		}
	} catch (error) {
		console.log(error);
	}
};
