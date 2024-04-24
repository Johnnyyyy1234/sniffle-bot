const { model, Schema } = require("mongoose");

const playerComplaintSchema = new Schema(
  {
    GuildID: {
      type: String,
      required: true,
      index: true,
    },
    userID: {
      type: String,
      required: true,
      index: true,
    },
    count: {
      type: Number,
      default: 0,
    },
  },
  { strict: false }
);

module.exports = model("playercomplaint", playerComplaintSchema);