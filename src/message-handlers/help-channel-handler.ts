import { Message, TextChannel } from 'discord.js';
import { config } from '@/data/config.js';
import { db } from '@/database/db.js';
import { moveChannelToBusy, moveChannelToUnbusy } from '@/misc/help-channel-ticker.js';

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

export async function handleHelpChannelMessagesDelete(message: Message<boolean>) {
  if (
    message.inGuild() &&
    message.guildId === config.discordIds.guildId &&
    config.discordIds.channels.helpChannels.includes(message.channelId)
  ) {
    const channel = message.channel;
    const mostRecentMessageCollection = await channel.messages.fetch({ limit: 1 });
    const mostRecentMessage = mostRecentMessageCollection.first();
    if (!mostRecentMessage) return;

    if (mostRecentMessage.author.bot) {
      for (const embed of mostRecentMessage.embeds) {
        if (
          embed.description &&
          (
            embed.description.includes('This channel has been made available again due to inactivity.') ||
            embed.description.includes('This channel is now available for another question')
          )
        ) {
          const fetchedChannel = await channel.fetch();
          if (fetchedChannel instanceof TextChannel) {
            await moveChannelToUnbusy(fetchedChannel);
          }
          break;
        }
      };
    }
  }
}