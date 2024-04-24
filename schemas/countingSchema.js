const { model, Schema } = require("mongoose");

const countingSchema = new Schema({
	Guild: String,
	Channel: String,
	Count: Number,
	MaxCount: Number,
});

module.exports = model("countingSchema", countingSchema);
