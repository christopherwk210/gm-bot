import { Guild, Client } from 'discord.js';

/**
 * Contains information about the server guild
 */
class GuildService {
  /** Represents the GM server guild */
  guild: Guild;

  /** Initialize the guild service with the bot client */
  init(client: Client) {
    this.guild = client.guilds.first();
  }
}

export let guildService = new GuildService();
