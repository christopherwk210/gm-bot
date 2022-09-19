import { CacheType, Interaction, ChatInputCommandInteraction } from 'discord.js';
import { getCommands } from '../singletons/commands.js';

export async function onInteractionCreate(interaction: Interaction<CacheType>) {
  if (!interaction.isChatInputCommand()) return;
  const commands = await getCommands();

  // Determine what commands to check (guild + global, or just global)
  const commandsCollection = interaction.inGuild() ? commands.guild.concat(commands.global) : commands.global;
	const command = commandsCollection.get(interaction.commandName);
	if (!command) return;

	try {
		await command.execute(interaction);
    if (!interaction.replied) handleInteractionErrors(interaction);
	} catch (error) {
		console.error(`Error executing command "${command.command.name}":`, error);
    handleInteractionErrors(interaction);
	}
}

async function handleInteractionErrors(interaction: ChatInputCommandInteraction<CacheType>) {
  const errorMessage = 'There was an error while executing this command!';
  if (interaction.isRepliable()) {
    await interaction.reply({ content: errorMessage, ephemeral: true });
  } else if (interaction.deferred) {
    await interaction.editReply({ content: errorMessage });
  }
}
