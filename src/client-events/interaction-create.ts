import {
  CacheType,
  Interaction,
  ChatInputCommandInteraction,
  AutocompleteInteraction,
  SelectMenuInteraction,
  MessageContextMenuCommandInteraction,
  UserContextMenuCommandInteraction,
  ModalSubmitInteraction,
  ButtonInteraction
} from 'discord.js';
import { getCommands } from '@/singletons/commands.js';

export async function onInteractionCreate(interaction: Interaction<CacheType>) {
  const command: BotCommand = await getCommand(interaction as any) as any;
  if (!command) return handleInteractionErrors(interaction as any);

  if (interaction.isChatInputCommand()) {
    try {
      await command.execute(interaction);
      if (!interaction.replied) handleInteractionErrors(interaction);
    } catch (error) {
      console.error(`Error executing command "${command.command.name}":`, error);
      handleInteractionErrors(interaction);
    }
    return;
  }

  if (interaction.isAutocomplete()) {
    if (!command.autocomplete) {
      await interaction.respond([]);
    } else {
      try {
        await command.autocomplete(interaction);
      } catch (error) {
        console.error(`Error executing autocomplete "${command.command.name}":`, error);
      }
    }
    return;
  }
  
  if (interaction.isContextMenuCommand()) {
    try {
      await ((command as any) as BotContextCommand).execute(interaction);
    } catch (error) {
      console.error(`Error responding to context menu "${command.command.name}":`, error);
    }
    return;
  }
  
  if (interaction.isStringSelectMenu()) handleSubInteraction(interaction, command, 'selectMenu');
  if (interaction.isModalSubmit() && command.modal) handleSubInteraction(interaction, command, 'modal');
  if (interaction.isButton() && command.button) handleSubInteraction(interaction, command, 'button');
}

async function handleSubInteraction(interaction: Interaction<CacheType>, command: BotCommand, subType: keyof BotCommand) {
  try {
    await (command[subType] as any).execute(interaction);
  } catch (error) {
    console.error(`Error responding to ${subType} "${command.command.name}":`, error);
    handleInteractionErrors(interaction as any);
  }
}

async function getCommand(
  interaction:
    ChatInputCommandInteraction<CacheType> |
    AutocompleteInteraction<CacheType> |
    SelectMenuInteraction<CacheType> |
    MessageContextMenuCommandInteraction<CacheType> |
    UserContextMenuCommandInteraction<CacheType> |
    ModalSubmitInteraction<CacheType> |
    ButtonInteraction<CacheType>
) {
  const commands = await getCommands();
  const commandsCollection = commands.guild.concat(commands.global);

  if (interaction.isStringSelectMenu()) {
    return commandsCollection.find(value =>
      !!(value.selectMenu && value.selectMenu.ids.includes(interaction.customId))
    );
  }

  if (interaction.isModalSubmit()) {
    return commandsCollection.find(value =>
      !!(value.modal && value.modal.ids.includes(interaction.customId))
    );
  }

  if (interaction.isButton()) {
    return commandsCollection.find(value =>
      !!(value.button && value.button.ids.includes(interaction.customId))
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
