import { Client, TextChannel, VoiceChannel, CategoryChannel, GuildChannel } from 'discord.js';

/**
 * Contains information about all of the server's channels
 */
class ChannelService {
  /** All server channels */
  channels: GuildChannel[] = [];

  /** All server categories */
  categoryChannels: CategoryChannel[] = [];

  /** All server text channels */
  textChannels: TextChannel[] = [];

  /** All server voice channels */
  voiceChannels: VoiceChannel[] = [];

  /** Initialize the channel service with the bot client */
  init(client: Client) {
    client.guilds.first().channels.array().forEach(guildChannel => {
      this.channels.push(guildChannel);

      switch (guildChannel.type) {
        case 'text':
          this.textChannels.push(<TextChannel>guildChannel);
          break;
        case 'voice':
          this.voiceChannels.push(<VoiceChannel>guildChannel);
          break;
        case 'category':
          this.categoryChannels.push(<CategoryChannel>guildChannel);
          break;
        default:
          // uhh, should never get here
          break;
      }
    });
  }

  /** Returns the server channel with the exact given name */
  getChannelByName(name: string) {
    return this.channels.find(channel => channel.name === name);
  }

  /** Returns the server channel with the exact given id number */
  getChannelByID(id: string) {
    return this.channels.find(channel => channel.id === id);
  }
}

export let channelService = new ChannelService();
