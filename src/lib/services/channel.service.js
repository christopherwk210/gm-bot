/**
 * Contains information about all of the server's channels
 */
let channelService = {
  /**
   * All server channels
   * @type {Array<*>}
   */
  channels: [],

  /**
   * All server text channels
   * @type {Array<*>}
   */
  textChannels: [],

  /**
   * All server voice channels
   * @type {Array<*>}
   */
  voiceChannels: [],

  /**
   * Initialize the channel service with the bot client
   * @param {*} client Bot client object
   */
  init: function(client) {
    client.guilds.first().channels.array().forEach(guildChannel => {
      this.channels.push(guildChannel);

      if (guildChannel.type === 'text') {
        this.textChannels.push(guildChannel);
      } else {
        this.voiceChannels.push(guildChannel);
      }
    });
  },

  /**
   * Returns the server channel with the exact given id number
   * @param {string} id Channel id
   */
  getChannelByID: function(id) {
    let match;

    this.channels.some(role => {
      if (role.id === id) {
        match = role;
        return true;
      }
    });

    return match;
  }
};

module.exports = channelService;
