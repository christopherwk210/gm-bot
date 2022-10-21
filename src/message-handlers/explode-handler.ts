import { Message } from 'discord.js';
import { config } from '@/data/config.js';

export async function handleExplodeCommandMessages(message: Message<boolean>) {
  if (
    message.inGuild() &&
    message.guildId === config.discordIds.guildId &&
    message.content.startsWith('!')
  ) {
    await message.author.send({
      content: 'Hey! It looks like you tried to use an old bot command. The bot has been updated to use the slash command format, so please press slash (/) to see what commands are available!',
    }).catch(() => {});

    return true;
  }

  return false;
}
