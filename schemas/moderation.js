const { model, Schema } = require("mongoose");

const moderationSchema = new Schema(
	{
		GuildID: String,
		MultiGuilded: Boolean, // Level 2
		MuteRoleID: String,
		LogChannelID: String,
	},
	{ strict: false },
);

module.exports = model("moderation", moderationSchema);
