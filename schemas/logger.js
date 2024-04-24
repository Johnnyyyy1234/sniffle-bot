const { model, Schema } = require("mongoose");

const loggerSchema = new Schema(
  {
    guildId: {
      type: String,
      required: true,
    },
    channelId: {
      type: String,
      required: true,
    },
    webhookId: {
      type: String,
      required: true,
    },
    webhookToken: {
      type: String,
      required: true,
    },
  },
  { strict: false }
);

module.exports = model("Logger", loggerSchema);