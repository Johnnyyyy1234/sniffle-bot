const { model, Schema } = require("mongoose");

const auditloggingSchema = new Schema({
	GuildID: String,
	GuildUpdate: {
		Enabled: { type: Boolean, default: false },
		Webhook: { type: String, default: "" },
		ChannelID: { type: String, default: "" },
	},
	ChannelCreate: {
		Enabled: { type: Boolean, default: false },
		Webhook: { type: String, default: "" },
		ChannelID: { type: String, default: "" },
	},
	ChannelUpdate: {
		Enabled: { type: Boolean, default: false },
		Webhook: { type: String, default: "" },
		ChannelID: { type: String, default: "" },
	},
	ChannelDelete: {
		Enabled: { type: Boolean, default: false },
		Webhook: { type: String, default: "" },
		ChannelID: { type: String, default: "" },
	},
	ChannelOverwriteCreate: {
		Enabled: { type: Boolean, default: false },
		Webhook: { type: String, default: "" },
		ChannelID: { type: String, default: "" },
	},
	ChannelOverwriteUpdate: {
		Enabled: { type: Boolean, default: false },
		Webhook: { type: String, default: "" },
		ChannelID: { type: String, default: "" },
	},
	ChannelOverwriteDelete: {
		Enabled: { type: Boolean, default: false },
		Webhook: { type: String, default: "" },
		ChannelID: { type: String, default: "" },
	},
	MessagePin: {
		Enabled: { type: Boolean, default: false },
		Webhook: { type: String, default: "" },
		ChannelID: { type: String, default: "" },
	},
	MessageUnpin: {
		Enabled: { type: Boolean, default: false },
		Webhook: { type: String, default: "" },
		ChannelID: { type: String, default: "" },
	},
	MessageDelete: {
		Enabled: { type: Boolean, default: false },
		Webhook: { type: String, default: "" },
		ChannelID: { type: String, default: "" },
	},
	MessageDeleteBulk: {
		Enabled: { type: Boolean, default: false },
		Webhook: { type: String, default: "" },
		ChannelID: { type: String, default: "" },
	},
	MessageUpdate: {
		Enabled: { type: Boolean, default: false },
		Webhook: { type: String, default: "" },
		ChannelID: { type: String, default: "" },
	},
	MemberKick: {
		Enabled: { type: Boolean, default: false },
		Webhook: { type: String, default: "" },
		ChannelID: { type: String, default: "" },
	},
	MemberPrune: {
		Enabled: { type: Boolean, default: false },
		Webhook: { type: String, default: "" },
		ChannelID: { type: String, default: "" },
	},
	MemberBanAdd: {
		Enabled: { type: Boolean, default: false },
		Webhook: { type: String, default: "" },
		ChannelID: { type: String, default: "" },
	},
	MemberBanRemove: {
		Enabled: { type: Boolean, default: false },
		Webhook: { type: String, default: "" },
		ChannelID: { type: String, default: "" },
	},
	MemberUpdate: {
		Enabled: { type: Boolean, default: false },
		Webhook: { type: String, default: "" },
		ChannelID: { type: String, default: "" },
	},
	MemberRoleUpdate: {
		Enabled: { type: Boolean, default: false },
		Webhook: { type: String, default: "" },
		ChannelID: { type: String, default: "" },
	},
	MemberMove: {
		Enabled: { type: Boolean, default: false },
		Webhook: { type: String, default: "" },
		ChannelID: { type: String, default: "" },
	},
	MemberDisconnect: {
		Enabled: { type: Boolean, default: false },
		Webhook: { type: String, default: "" },
		ChannelID: { type: String, default: "" },
	},
	BotAdd: {
		Enabled: { type: Boolean, default: false },
		Webhook: { type: String, default: "" },
		ChannelID: { type: String, default: "" },
	},
	RoleCreate: {
		Enabled: { type: Boolean, default: false },
		Webhook: { type: String, default: "" },
		ChannelID: { type: String, default: "" },
	},
	RoleUpdate: {
		Enabled: { type: Boolean, default: false },
		Webhook: { type: String, default: "" },
		ChannelID: { type: String, default: "" },
	},
	RoleDelete: {
		Enabled: { type: Boolean, default: false },
		Webhook: { type: String, default: "" },
		ChannelID: { type: String, default: "" },
	},
	InviteCreate: {
		Enabled: { type: Boolean, default: false },
		Webhook: { type: String, default: "" },
		ChannelID: { type: String, default: "" },
	},
	InviteUpdate: {
		Enabled: { type: Boolean, default: false },
		Webhook: { type: String, default: "" },
		ChannelID: { type: String, default: "" },
	},
	InviteDelete: {
		Enabled: { type: Boolean, default: false },
		Webhook: { type: String, default: "" },
		ChannelID: { type: String, default: "" },
	},
	WebhookCreate: {
		Enabled: { type: Boolean, default: false },
		Webhook: { type: String, default: "" },
		ChannelID: { type: String, default: "" },
	},
	WebhookUpdate: {
		Enabled: { type: Boolean, default: false },
		Webhook: { type: String, default: "" },
		ChannelID: { type: String, default: "" },
	},
	WebhookDelete: {
		Enabled: { type: Boolean, default: false },
		Webhook: { type: String, default: "" },
		ChannelID: { type: String, default: "" },
	},
	EmojiCreate: {
		Enabled: { type: Boolean, default: false },
		Webhook: { type: String, default: "" },
		ChannelID: { type: String, default: "" },
	},
	EmojiUpdate: {
		Enabled: { type: Boolean, default: false },
		Webhook: { type: String, default: "" },
		ChannelID: { type: String, default: "" },
	},
	EmojiDelete: {
		Enabled: { type: Boolean, default: false },
		Webhook: { type: String, default: "" },
		ChannelID: { type: String, default: "" },
	},
	StickerCreate: {
		Enabled: { type: Boolean, default: false },
		Webhook: { type: String, default: "" },
		ChannelID: { type: String, default: "" },
	},
	StickerUpdate: {
		Enabled: { type: Boolean, default: false },
		Webhook: { type: String, default: "" },
		ChannelID: { type: String, default: "" },
	},
	StickerDelete: {
		Enabled: { type: Boolean, default: false },
		Webhook: { type: String, default: "" },
		ChannelID: { type: String, default: "" },
	},
	GuildScheduledEventCreate: {
		Enabled: { type: Boolean, default: false },
		Webhook: { type: String, default: "" },
		ChannelID: { type: String, default: "" },
	},
	GuildScheduledEventUpdate: {
		Enabled: { type: Boolean, default: false },
		Webhook: { type: String, default: "" },
		ChannelID: { type: String, default: "" },
	},
	GuildScheduledEventDelete: {
		Enabled: { type: Boolean, default: false },
		Webhook: { type: String, default: "" },
		ChannelID: { type: String, default: "" },
	},
	ThreadCreate: {
		Enabled: { type: Boolean, default: false },
		Webhook: { type: String, default: "" },
		ChannelID: { type: String, default: "" },
	},
	ThreadUpdate: {
		Enabled: { type: Boolean, default: false },
		Webhook: { type: String, default: "" },
		ChannelID: { type: String, default: "" },
	},
	ThreadDelete: {
		Enabled: { type: Boolean, default: false },
		Webhook: { type: String, default: "" },
		ChannelID: { type: String, default: "" },
	},
});

module.exports = model("auditlog", auditloggingSchema);
