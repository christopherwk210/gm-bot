import { Message, TextChannel } from 'discord.js';
import { config } from '@/data/config.js';
import { db } from '@/database/db.js';
import { moveChannelToBusy } from '@/misc/help-channel-ticker.js';

export async function handleHelpChannelMessages(message: Message<boolean>) {
  if (
    message.inGuild() &&
    message.guildId === config.discordIds.guildId &&
    config.discordIds.channels.helpChannels.includes(message.channelId)
  ) {
    await db.helpChannel.createOrUpdate(message.channelId, new Date());
    await moveChannelToBusy(message.channel as TextChannel);
  }
}
