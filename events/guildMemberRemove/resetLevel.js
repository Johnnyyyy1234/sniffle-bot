const User = require("../../schemas/levels");

module.exports = async (client, member) => {
	try {
		const dataGD = await User.findOne({ GuildID: member.guild.id });
		if (!dataGD) return;

		await User.findOneAndDelete({
			GuildID: member.guild.id,
			UserID: member.user.id,
		});
	} catch (error) {
		return;
	}
};
