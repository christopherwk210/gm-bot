import { Message } from 'discord.js';
import { config } from '../singletons/config.js';

export function handleExplodeCommandMessages(message: Message<boolean>) {
  if (
    message.inGuild() &&
    message.guildId === config.discordIds.guildId &&
    message.content.startsWith('!')
  ) {
    message.reply({
      content: 'Hey! It looks like you tried to use an old bot command. The bot has been updated to use the slash command format, so please press slash (/) to see what commands are available!',
    }).catch(() => {});
  }
}
