const { Schema, model } = require("mongoose");

const noteSchema = new Schema({
	GuildID: { type: String },
	UserID: { type: String },
	Notes: [
		{
			Note: String,
			Moderator: String,
			CreatedAt: Number,
			ID: String,
		},
	],
});

module.exports = model("notes", noteSchema);
