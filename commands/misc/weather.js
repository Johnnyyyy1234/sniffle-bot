const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
require("colors");

const fetch = (...args) =>
	import("node-fetch").then(({ default: fetch }) => fetch(...args));

module.exports = {
	data: new SlashCommandBuilder()
		.setName("weather")
		.setDescription("Get detailed weather information for a location")
		.addStringOption((option) =>
			option
				.setName("location")
				.setDescription("Enter the city, state, country, or zip code")
				.setRequired(true),
		),
	run: async (client, interaction) => {
		try {
			await interaction.deferReply();
			const location = interaction.options.getString("location");
			const apiKey = "cb67b97dc9cb4193899164221241901";
			const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${location}`;

			const response = await fetch(url);
			const data = await response.json();

			// Check for invalid place name
			if (!data.location) {
				return await interaction.editReply({
					embeds: [
						new EmbedBuilder()
							.setColor(0xff0000)
							.setTitle("Invalid Location Name")
							.setDescription(
								"The location you entered could not be found. Please try a different one.",
							)
							.setFooter({ text: "Powered by WeatherAPI" }),
					],
				});
			}

			// Extract weather information from the response
			const {
				location: { name, region, country, localtime },
				current: {
					temp_c,
					temp_f,
					feelslike_f,
					condition: { text, icon },
					wind_kph,
					wind_dir,
					wind_mph,
					wind_degree,
					cloud,
					humidity,
					feelslike_c,
					uv,
					pressure_mb,
					gust_mph,
					gust_kph,
				},
			} = data;

			// Build and send weather embed
			const embed = new EmbedBuilder()
				.setColor(0x0099ff)
				.setTitle(`Weather in ${name}, ${region}, ${country}`)
				.setThumbnail(
					`https://www.weatherapi.com/static/img/weather/png/${icon}.png`,
				)
				.addFields(
					{
						name: "Current Temperature°C",
						value: `${temp_c}°C (feels like ${feelslike_c}°C)`,
					},
					{ name: "Condition", value: text },
					{ name: "Wind KPH", value: `${wind_kph} km/h | ${wind_dir}` },
					{ name: "Humidity", value: `${humidity}%` },
					{ name: "UV Index", value: `${uv}` },
					{ name: "Pressure", value: `${pressure_mb} mb` },
					{
						name: "Current Temperature°F",
						value: `${temp_f}°F (feels like ${feelslike_f}°F)`,
					},
					{ name: "Wind MPH", value: `${wind_mph} mph | ${wind_dir}` },
					{ name: "Wind Degree", value: `${wind_degree}°` },
					{ name: "Gust MPH", value: `${gust_mph}%` },
					{ name: "Cloud", value: `${cloud}%` },
					{ name: "Gust KPH", value: `${gust_kph}%` },
				)
				.setFooter({
					text: `Local Time: ${localtime} || Powered by WeatherAPI`,
				});

			await interaction.editReply({ embeds: [embed] });
		} catch (err) {
			console.log(`| [ERROR] | ${err.stack}`.red);
			await interaction.editReply({
				embeds: [
					new EmbedBuilder()
						.setColor(0xff0000)
						.setTitle("Error Fetching Weather")
						.setDescription(
							"An error occurred while fetching weather data. Please try again later.",
						)
						.setFooter({ text: "Powered by WeatherAPI" }),
				],
			});
		}
	},
};
