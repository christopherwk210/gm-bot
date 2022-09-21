import { client } from './singletons/client.js';
import { config } from './singletons/config.js';

/**
 * A more concise way of fetching channels based on config id's
 */
export async function fetchChannel(channelName: keyof typeof config.discordIds.channels) {
  const channelId = config.discordIds.channels[channelName];
  try {
    return await client.channels.fetch(channelId);
  } catch (e) {
    return null;
  }
}
