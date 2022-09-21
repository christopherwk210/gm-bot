import {
  CacheType,
  Interaction,
  ChatInputCommandInteraction,
  AutocompleteInteraction,
  SelectMenuInteraction
} from 'discord.js';
import { getCommands } from '../singletons/commands.js';

export async function onInteractionCreate(interaction: Interaction<CacheType>) {
  if (interaction.isAutocomplete()) {
    handleAutocomplete(interaction)
  } else if (interaction.isChatInputCommand()) {
    handleChatInputCommand(interaction);
  } else if (interaction.isSelectMenu()) {
    handleSelectMenu(interaction);
  }
}

async function handleSelectMenu(interaction: SelectMenuInteraction<CacheType>) {
  const command = await getCommand(interaction);
  if (!command) return;
  if (!command.selectMenu) return;

  try {
    await command.selectMenu.handle(interaction);
  } catch (error) {
    console.error(`Error responding to select menu "${command.command.name}":`, error);
  }
}

async function handleAutocomplete(interaction: AutocompleteInteraction<CacheType>) {
  const command = await getCommand(interaction);
  if (!command) return;
  if (!command.autocomplete) {
    await interaction.respond([]);
    return;
  }

  try {
    await command.autocomplete(interaction);
  } catch (error) {
    console.error(`Error executing autocomplete "${command.command.name}":`, error);
  }
}

async function handleChatInputCommand(interaction: ChatInputCommandInteraction<CacheType>) {
  const command = await getCommand(interaction);
  if (!command) return;

	try {
		await command.execute(interaction);
    if (!interaction.replied) handleInteractionErrors(interaction);
	} catch (error) {
		console.error(`Error executing command "${command.command.name}":`, error);
    handleInteractionErrors(interaction);
	}
}

async function getCommand(
  interaction:
    ChatInputCommandInteraction<CacheType> |
    AutocompleteInteraction<CacheType> |
    SelectMenuInteraction<CacheType>
) {
  const commands = await getCommands();

  // Determine what commands to check (guild + global, or just global)
  const commandsCollection = interaction.inGuild() ? commands.guild.concat(commands.global) : commands.global;

  if (interaction.isSelectMenu()) {
    return commandsCollection.find(value =>
      !!(value.selectMenu && value.selectMenu.customId === interaction.customId)
    );
  }

  const command = commandsCollection.get(interaction.commandName);
  return command;
}

async function handleInteractionErrors(interaction: ChatInputCommandInteraction<CacheType>) {
  const errorMessage = 'There was an error while executing this command!';
  if (interaction.isRepliable()) {
    await interaction.reply({ content: errorMessage, ephemeral: true });
  } else if (interaction.deferred) {
    await interaction.editReply({ content: errorMessage });
  }
}
