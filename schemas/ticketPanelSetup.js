const { model, Schema } = require("mongoose");

const ticketPanelSetup = new Schema(
  {
    guildID: String,
    channelID: String,
    messageID: String,
    panelName: {
      type: String,
      required: true,
    },
    embed: {
      title: String,
      description: String,
      color: String,
      fields: [
        {
          name: String,
          value: String,
          inline: Boolean,
        },
      ],
    },
    buttons: [
      {
        buttonLabel: String,
        buttonEmoji: String,
        targetChannel: String,
        roles: [String],
        style: String,
        customID: String,
      },
    ],
    menus: [
      {
        customID: String,
        placeholder: String,
        minValues: Number,
        maxValues: Number,
        options: [
          {
            label: String,
            value: String,
            targetChannel: String,
            roles: [String],
          },
        ],
      },
    ],
  },
  {
    strict: false,
    timestamps: true,
  }
);

module.exports = model("ticketpanel", ticketPanelSetup);