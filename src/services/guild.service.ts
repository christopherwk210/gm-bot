import { Guild, Client } from "discord.js";

interface GuildService {
  /** Represents the GM server guild */
  guild: Guild;

  /** Initialize the guild service with the bot client */
  init(client: Client);
}

/**
 * Contains information about the server guild
 */
export let guildService: GuildService = {
  guild: undefined,

  init: function(client) {
    this.guild = client.guilds.first();
  }
};
