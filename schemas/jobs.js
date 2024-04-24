const { Schema, model } = require("mongoose");

const jobsSchema = new Schema({
	GuildID: { type: String, required: true },
	LogChannel: { type: String, required: true },
	JobsChannel: { type: String, required: true },
	Jobs: [
		{
			MessageID: { type: String, required: true },
			Status: { type: String, required: true },
			Users: [
				{
					Status: { type: String, default: "Pending" },
					UserID: { type: String },
					savedID: { type: String },
					jobMessageID: { type: String },
				},
			],
		},
	],
});

module.exports = model("jobs", jobsSchema);
