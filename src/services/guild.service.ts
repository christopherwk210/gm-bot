/**
 * Contains information about the server guild
 */
export let guildService = {
  /**
   * Represents the GM server guild
   */
  guild: {},

  /**
   * Initialize the guild service with the bot client
   * @param {*} client Bot client object
   */
  init: function(client) {
    this.guild = client.guilds.first();
  }
};
