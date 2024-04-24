module.exports = async (client, interaction) => {
  if (!interaction.isAutocomplete()) return;
  return;

  const command = client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.autocomplete(interaction);
  } catch (error) {
    console.error(error);
  }
};
