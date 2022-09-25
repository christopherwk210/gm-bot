import { client } from '../singletons/client.js';
import { config } from '../singletons/config.js';

export function getGuild() {
  return client.guilds.fetch(config.discordIds.guildId);
}

export async function getTextChannel(id: string) {
  const guild = await getGuild();
  const channel = await guild.channels.fetch(id).catch(() => {});
  if (channel && channel.isTextBased()) return channel;
  return undefined;
}
