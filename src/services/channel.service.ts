/**
 * Contains information about all of the server's channels
 */
export let channelService = {
  /**
   * All server channels
   * @type {Array<*>}
   */
  channels: [],

  /**
   * All server categories
   */
  categoryChannels: [],

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

      switch(guildChannel.type) {
        case 'text':
          this.textChannels.push(guildChannel);
          break;
        case 'voice':
          this.voiceChannels.push(guildChannel);
          break;
        case 'category':
          this.categoryChannels.push(guildChannel);
          break;
        default:
          // uhh, should never get here
          break;
      }
    });
  },

  /**
   * Returns the server channel with the exact given name
   * @param {string} name Channel name
   */
  getChannelByName: function(name) {
    let match;

    this.channels.some(channel => {
      if (channel.name === name) {
        match = channel;
        return true;
      }
    });

    return match;
  },

  /**
   * Returns the server channel with the exact given id number
   * @param {string} id Channel id
   */
  getChannelByID: function(id) {
    let match;

    this.channels.some(channel => {
      if (channel.id === id) {
        match = channel;
        return true;
      }
    });

    return match;
  }
};
