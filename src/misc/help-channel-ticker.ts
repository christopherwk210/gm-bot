import { config } from '@/data/config.js';
import { db } from '@/database/db.js';
import { Client, EmbedBuilder, TextChannel } from 'discord.js';

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
        const embed = new EmbedBuilder()
        .setColor(config.defaultEmbedColor)
        .setDescription(`This channel has been made available again due to inactivity.`)
        .setTimestamp(new Date());

        channel.send({ embeds: [embed] });
        moveChannelToUnbusy(channel);
      }
    }
  }
}

export async function moveChannelToBusy(channel: TextChannel) {
  await channel.setParent(config.discordIds.channelCategories.helpBusy).catch(() => {});
  await updateChannelPosition(channel);
}

export async function moveChannelToUnbusy(channel: TextChannel) {
  await channel.setParent(config.discordIds.channelCategories.help).catch(() => {});
  await updateChannelPosition(channel);
}

async function updateChannelPosition(channel: TextChannel) {
  const parent = channel.parent;
  if (!parent) return;

  const category = await parent.fetch().catch(() => null);
  if (!category) return;

  category.children.cache.forEach(async ch => {
    const position = config.discordIds.channels.helpChannels.indexOf(ch.id);
    if (position === -1) return;
    ch.setPosition(position).catch(() => {});
  })
}