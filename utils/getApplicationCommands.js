module.exports = async (client, guildId) => {
  try {
    let applicationCommands;

    if (guildId) {
      const guild = await client.guilds.fetch(guildId);
      applicationCommands = guild.commands;
    } else {
      applicationCommands = client.application.commands;
    }

    await applicationCommands.fetch();
    return applicationCommands;
  } catch (error) {
    console.log(error)
  }

};
