import { TextChannel, VoiceChannel, Message } from 'discord.js';
import { serverIDs, voiceTextMessageTimeout, voiceTextMessageScanRate } from '../../config';
import { channelService } from './channel.service';

/**
 * Handles removing old messages from the voice text channels,
 * as well as blocking messages from users not currently in voice.
 */
class VoiceChannelService {
  monitoredBundles: VoiceChannelBundle[];

  init() {
    this.cacheChannels();
    setInterval(this.scanVoiceTextChannels.bind(this), voiceTextMessageScanRate);
  }

  handleMessage(msg: Message) {
    if (msg.member && msg.member.roles.has(serverIDs.roles.serverStaff)) return;

    // Check if in a valid bundle
    const thisBundle = this.monitoredBundles.find(bundle => bundle.textChannelIDs.includes(msg.channel.id));
    if (!thisBundle) return;

    // Is this user in a valid voice channel?
    const voiceChannelPresentIn = thisBundle.voiceChannels.find(channel => channel.members.get(msg.author.id) !== undefined);
    if (voiceChannelPresentIn) return;

    // Get yer memes out of my server
    msg.author.send('Sorry, you cannot send messages in a voice text channel without being in voice!');
    msg.delete();
  }

  /**
   * Scans the bundle text channels for old messages, and deletes them if found
   */
  scanVoiceTextChannels() {
    this.monitoredBundles.forEach(bundle => {
      bundle.textChannels.forEach(async channel => {
        let msgs = await channel.fetchMessages({ limit: 100 });
        msgs = msgs.filter(msg => Date.now() - voiceTextMessageTimeout > msg.createdTimestamp && !msg.pinned);
        channel.bulkDelete(msgs).catch(() => console.log('Error bulk deleting'));
      });
    });
  }

  /**
   * Adds voice channel and text channel pairings to be handled by the voice channel service
   */
  addMonitoredBundle(voiceChannelIDs: string[], textChannelIDs: string[]) {
    const voiceChannels = voiceChannelIDs.map(id => channelService.getVoiceChannelByID(id));
    const textChannels = textChannelIDs.map(id => channelService.getTextChannelByID(id));

    this.monitoredBundles.push({
      textChannelIDs,
      voiceChannelIDs,
      voiceChannels,
      textChannels
    });
  }

  /**
   * Sets up the proper voice & text channel pairings
   */
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
