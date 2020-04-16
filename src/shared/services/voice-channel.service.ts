import { TextChannel, VoiceChannel, Message, GuildChannel } from 'discord.js';
import { serverIDs, voiceTextMessageTimeout } from '../../config';
import { channelService } from './channel.service';

/**
 * Handles removing old messages from the voice text channels,
 * as well as blocking messages from users not currently in voice.
 */
class VoiceChannelService {
  monitoredBundles: VoiceChannelBundle[];

  handleMessage(msg: Message) {
    if (msg.member && msg.member.roles.has(serverIDs.roles.serverStaff)) {
      return;
    }

    const thisBundle = this.monitoredBundles.find(bundle =>
      bundle.textChannelIDs.includes(msg.channel.id)
    );

    // If we don't care, then we don't care!
    if (!thisBundle) return;

    // Is this user in a valid voice channel?
    const voiceChannelPresentIn = thisBundle.voiceChannels.find(
      channel => channel.members.get(msg.author.id) !== undefined
    );
    if (voiceChannelPresentIn) return;

    // Get yer memes out of my server
    msg.author.send(
      'Sorry, you cannot send messages in a voice text channel without being in voice!'
    );
    msg.delete();
  }

  scanVoiceTextChannels() {
    this.monitoredBundles.forEach(bundle => {
      bundle.textChannels.forEach(async channel => {
        let msgs = await channel.fetchMessages({ limit: 100 });
        msgs = msgs.filter(msg => {
          return Date.now() - voiceTextMessageTimeout > msg.createdTimestamp && !msg.pinned;
        });
        channel.bulkDelete(msgs).catch(() => console.log('Error bulk deleting'));
      });
    });
  }

  addMonitoredBundle(voiceChannelIDs: string[], textChannelIDs: string[]) {
    const voiceChannels: VoiceChannel[] = [];
    const textChannels: TextChannel[] = [];
    voiceChannelIDs.forEach(id => {
      voiceChannels.push(channelService.getChannelByID(id) as VoiceChannel);
    });
    textChannelIDs.forEach(id => {
      textChannels.push(channelService.getChannelByID(id) as TextChannel);
    });
    this.monitoredBundles.push({
      textChannelIDs,
      voiceChannelIDs,
      voiceChannels,
      textChannels
    });
  }

  cacheChannels() {
    this.monitoredBundles = [];
    this.addMonitoredBundle(
      [serverIDs.channels.coworkingVoiceChannelID],
      [serverIDs.channels.coworkingTextChannelID]
    );
    this.addMonitoredBundle(
      [serverIDs.channels.casualVoiceChannelID, serverIDs.channels.playinaGameVoiceChannelID],
      [serverIDs.channels.casualTextChannelID]
    );
  }
}

interface VoiceChannelBundle {
  /** Text Channel IDs */
  textChannelIDs: string[];

  /** Voice Channel IDs */
  voiceChannelIDs: string[];

  /** TextChannel references */
  textChannels: TextChannel[];

  /** VoiceChannel references */
  voiceChannels: VoiceChannel[];
}

export let voiceChannelService = new VoiceChannelService();
