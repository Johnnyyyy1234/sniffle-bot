const { model, Schema } = require("mongoose");

const auditloggingSchema = new Schema(
	{
		GuildID: String,
		Webhooks: Array,
		ChannelLogs: Array,
		GuildLogs: Array,
		MemberLogs: Array,
		IntegrationLogs: Array,
		OtherLogs: Array,
	},
	{ strict: false },
);

module.exports = model("auditlog", auditloggingSchema);
