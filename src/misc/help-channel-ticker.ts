import { config } from '@/data/config.js';
import { db } from '@/database/db.js';
import { Client, TextChannel } from 'discord.js';

export function setupHelpChannelTicker(client: Client<boolean>) {
  setInterval(() => handleHelpChannelOps(client), 60_000);
}

async function handleHelpChannelOps(client: Client<boolean>) {
  for (const helpChannel of config.discordIds.channels.helpChannels) {
    const timestamp = await db.helpChannel.getBusyTimestampForChannel(helpChannel);
    const unbusyTimestamp = timestamp.getTime() + config.helpChannelBusyTimeout;

    if (Date.now() > unbusyTimestamp) {
      const channel: TextChannel | null = await client.channels.fetch(helpChannel) as any;
      if (
        channel &&
        channel.parent &&
        channel.parentId === config.discordIds.channelCategories.helpBusy
      ) {
        moveChannelToUnbusy(channel);
      }
    }
  }
}

export async function moveChannelToBusy(channel: TextChannel) {
  return await channel.setParent(config.discordIds.channelCategories.helpBusy).catch(() => {});
}

export async function moveChannelToUnbusy(channel: TextChannel) {
  return await channel.setParent(config.discordIds.channelCategories.help).catch(() => {});
}
