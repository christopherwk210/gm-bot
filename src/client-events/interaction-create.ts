import {
  CacheType,
  Interaction,
  ChatInputCommandInteraction,
  AutocompleteInteraction,
  SelectMenuInteraction,
  MessageContextMenuCommandInteraction,
  UserContextMenuCommandInteraction,
  ModalSubmitInteraction
} from 'discord.js';
import { getCommands } from '../singletons/commands.js';

export async function onInteractionCreate(interaction: Interaction<CacheType>) {
  if (interaction.isAutocomplete()) {
    handleAutocomplete(interaction)
  } else if (interaction.isChatInputCommand()) {
    handleChatInputCommand(interaction);
  } else if (interaction.isSelectMenu()) {
    handleSelectMenu(interaction);
  } else if (interaction.isContextMenuCommand()) {
    handleContextMenu(interaction);
  } else if (interaction.isModalSubmit()) {
    handleModalSubmit(interaction);
  }
}

async function handleModalSubmit(interaction: ModalSubmitInteraction<CacheType>) {
  const command = await getCommand(interaction);
  if (!command) return;
  if (!command.modal) return;

  try {
    await command.modal.execute(interaction);
  } catch (error) {
    console.error(`Error responding to modal "${command.command.name}":`, error);
  }
}

async function handleContextMenu(interaction: MessageContextMenuCommandInteraction<CacheType> | UserContextMenuCommandInteraction<CacheType>) {
  const command: BotContextCommand | undefined = await getCommand(interaction) as any;
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`Error responding to context menu "${command.command.name}":`, error);
  }
}

async function handleSelectMenu(interaction: SelectMenuInteraction<CacheType>) {
  const command = await getCommand(interaction);
  if (!command) return;
  if (!command.selectMenu) return;

  try {
    await command.selectMenu.execute(interaction);
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
  const command: BotCommand = await getCommand(interaction) as any;
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
    SelectMenuInteraction<CacheType> |
    MessageContextMenuCommandInteraction<CacheType> |
    UserContextMenuCommandInteraction<CacheType> |
    ModalSubmitInteraction<CacheType>
) {
  const commands = await getCommands();

  // Determine what commands to check (guild + global, or just global)
  const commandsCollection = interaction.inGuild() ? commands.guild.concat(commands.global) : commands.global;

  if (interaction.isSelectMenu()) {
    return commandsCollection.find(value =>
      !!(value.selectMenu && value.selectMenu.ids.includes(interaction.customId))
    );
  }

  if (interaction.isModalSubmit()) {
    return commandsCollection.find(value =>
      !!(value.modal && value.modal.ids.includes(interaction.customId))
    );
  }

  const command = commandsCollection.get(interaction.commandName);
  return command;
}

async function handleInteractionErrors(interaction: ChatInputCommandInteraction<CacheType>) {
  const errorMessage = 'There was an error while executing this command!';
  if (interaction.deferred) {
    await interaction.editReply({ content: errorMessage });
  } else if (interaction.isRepliable()) {
    await interaction.reply({ content: errorMessage, ephemeral: true }); 
  }
}
