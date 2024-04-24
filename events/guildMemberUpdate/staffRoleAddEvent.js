const { EmbedBuilder, Client, GuildMember } = require("discord.js");
const fs = require('fs');
const staffProfileSetupSchema = require("../../schemas/staffProfileSetup")

module.exports = async (client, oldMember, newMember) => {
  return;
  try {
    const dataGD = await staffProfileSetupSchema.findOne({ GuildID: newMember.guild.id });
    if (!dataGD) return;
    const logChannel = newMember.guild.channels.cache.get(dataGD.LogChannelID);

    const roleChangePattern = getRoleChangePattern(oldMember, newMember);

    // Initialize pattern if it doesn't exist
    if (!feedbackData[roleChangePattern]) {
      feedbackData[roleChangePattern] = {
        promotion: 0.33,
        demotion: 0.33,
        other: 0.34
      };
    }

    const logEmbed = logRoleChange(newMember, roleChangePattern);
    const sentMessage = await logChannel.send({ embeds: [logEmbed] });

    // Add reactions 
    sentMessage.react('👍'); // Promotion
    sentMessage.react('👎'); // Demotion
    sentMessage.react('❓'); // Other/Unclear

    // Collect reactions 
    const filter = (reaction, user) => !user.bot;
    const collector = sentMessage.createReactionCollector({ filter, time: timeoutDuration });

    collector.on('collect', (reaction) => {
      updateConfidence(roleChangePattern, reaction.emoji.toString());
      saveFeedbackData();
    });
  } catch (error) {
    console.error(error);
    await logChannel.send("An error occured: ", error)
  }
};