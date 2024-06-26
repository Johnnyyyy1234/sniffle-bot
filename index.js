require("dotenv/config");
const { Client, GatewayIntentBits } = require("discord.js");
const eventHandler = require("./handlers/eventHandler");
const { errorHandler } = require("./utils/errorHandler");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildScheduledEvents,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildEmojisAndStickers,
  ],
  maxCachedMembers: Number.Infinity,
});

eventHandler(client);
errorHandler(client);
client.login(process.env.TOKEN);