/**
 * Contains information about the server guild
 */
let guildSevice = {
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

module.exports = guildSevice;
