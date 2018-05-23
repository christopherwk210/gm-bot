import { Client, TextChannel, VoiceChannel, CategoryChannel } from "discord.js";

interface ChannelService {
  /** All server channels */
  channels: Array<TextChannel | VoiceChannel | CategoryChannel>;

  /** All server categories */
  categoryChannels: CategoryChannel[];

  /** All server text channels */
  textChannels: TextChannel[];

  /** All server voice channels */
  voiceChannels: VoiceChannel[];

  /** Initialize the channel service with the bot client */
  init(client: Client);

  /** Returns the server channel with the exact given name */
  getChannelByName(name: string);

  /** Returns the server channel with the exact given id number */
  getChannelByID(id: string)
}

/**
 * Contains information about all of the server's channels
 */
export let channelService: ChannelService = {
  channels: [],
  categoryChannels: [],
  textChannels: [],
  voiceChannels: [],

  init: function(client: Client) {
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
