const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const axios = require("axios");
const mConfig = require("../../messageConfig.json");
const os = require("os");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("api")
    .setDescription("Make an API request")
    .addSubcommand(subcommand =>
      subcommand
        .setName("request")
        .setDescription("Send an API request")
        .addStringOption(option =>
          option
            .setName("method")
            .setDescription("HTTP method")
            .setRequired(true)
            .addChoices(
              { name: "GET", value: "GET" },
              { name: "POST", value: "POST" },
              { name: "PUT", value: "PUT" },
              { name: "DELETE", value: "DELETE" },
              { name: "PATCH", value: "PATCH" },
              { name: "HEAD", value: "HEAD" },
              { name: "OPTIONS", value: "OPTIONS" }
            )
        )
        .addStringOption(option =>
          option
            .setName("url")
            .setDescription("API endpoint URL")
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName("headers")
            .setDescription("JSON-formatted headers")
        )
        .addStringOption(option =>
          option
            .setName("body")
            .setDescription("JSON-formatted request body")
        )
    ),
  botPermissions: [],
  userPermissions: [],

  run: async (client, interaction) => {
    try {
      const subcommand = interaction.options.getSubcommand();

      if (subcommand === "request") {
        const method = interaction.options.getString("method");
        const url = interaction.options.getString("url");
        const headers = interaction.options.getString("headers")
          ? JSON.parse(interaction.options.getString("headers"))
          : {};
        const body = interaction.options.getString("body")
          ? JSON.parse(interaction.options.getString("body"))
          : {};

        if (!url.startsWith("http://") && !url.startsWith("https://")) {
          return interaction.reply({
            content: "Invalid URL provided. URLs must start with 'http://' or 'https://'.",
            ephemeral: true,
          });
        }

        try {
          const response = await axios({
            method,
            url,
            headers,
            data: body,
          });

          // Get the server's IP address
          const serverIpAddress = Object.values(os.networkInterfaces())
            .flat()
            .filter(info => info.family === "IPv4" && !info.internal)
            .map(info => info.address)[0];

          // Replace the server's IP address in the response body with a placeholder
          const responseBody = JSON.stringify(response.data, null, 2).replace(
            new RegExp(serverIpAddress, "g"),
            "[SERVER_IP_REDACTED]"
          );

          const embed = new EmbedBuilder()
            .setTitle(`API Response (${method} ${url})`)
            .addFields(
              { name: "Status Code", value: `${response.status}`, inline: true },
              { name: "Status Text", value: `${response.statusText}`, inline: true }
            )
            .addFields({ name: "Response Body", value: `\`\`\`json\n${responseBody}\n\`\`\``, inline: false });

          interaction.reply({ embeds: [embed] });
        } catch (error) {
          console.error(error);
          interaction.reply({
            content: `An error occurred while making the API request: ${error.message}`,
            ephemeral: true,
          });
        }
      }
    } catch (error) {
      console.log(error);
    }
  },
};