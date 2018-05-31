import { Message, VoiceConnection, StreamDispatcher, GuildMember, VoiceChannel } from 'discord.js';
import { prefixedCommandRuleTemplate } from '../../config';
import { Command, CommandClass, detectStaff } from '../../shared';

import youtubedl = require('youtube-dl');
import * as util from 'util';

const asyncGetYoutubeInfo = util.promisify(youtubedl.getInfo);

@Command({
  matches: ['play', 'resume', 'pause', 'skip', 'queue', 'volume', 'kick'],
  ...prefixedCommandRuleTemplate
})
export class AudioCommand implements CommandClass {
  /** Represents the current voice channel connection */
  currentConnection: VoiceConnection;

  /** Voice packet dispatcher */
  dispatch: StreamDispatcher;

  /** Playback queue */
  queue = [];

  /** Stream volume */
  volume = 100;

  /**
   * Handles all music playing functionality of the bot
   * @param msg 
   * @param args 
   */
  async action(msg: Message, args: string[]) {
    if (!this.validateVoiceConnection(msg.member)) {
      msg.author.send('You must be in a voice channel in /r/GameMaker to do that!');
      return;
    }

    switch (args[0].slice(1)) {
      case 'play':
        let url = args.find(item => !!~item.indexOf('http'));
        let voiceChannel = msg.member.voiceChannel;
        let result = await this.play(url, voiceChannel);
        msg.author.send(result);
        break;
      case 'resume':
        this.resume();
        break;
      case 'pause':
        this.pause();
        break;
      case 'skip':
        this.skip();
        break;
      case 'queue':
        msg.author.send( this.getQueueAsMessage() );
        break;
      case 'volume':
        if (!args[1]) return msg.author.send(`Current volume: ${this.volume}`);
        msg.author.send( this.setVolume(args[1]) );
        break;
      case 'kick':
        this.kick();
        break;
    }
  }

  /**
   * STAFF ONLY KEEP OUT
   * @param msg 
   * @param args
   */
  pre(msg: Message, args: string[]) {
    return !!detectStaff(msg.member);
  }

  /**
   * Adds a URL to the queue, playing it immediately if nothing else is already in the queue
   * @param url HTTP url of item to play
   * @param voiceChannel Voice channel to join for playback
   */
  async play(url: string, voiceChannel: VoiceChannel) {
    if (!url) return 'You didn\'t specify a song to play, silly!';

    // Attempt to connect to voice
    let connection: VoiceConnection;
    try {
      connection = await voiceChannel.join();
    } catch (e) {
      return 'Could not establish a voice connection!';
    }

    // Save the connection
    this.currentConnection = connection;

    // Fetch URL info
    let info;
    try {
      info = await asyncGetYoutubeInfo(url, ['-q', '--no-warnings', '--force-ipv4']);
    } catch (e) {
      return 'Could not get info from URL!';
    }

    // Ensure valid info was fetched
    if (info.format_id === undefined || info.format_id.startsWith('0')) return 'Invalid URL';

    // Save to queue
    this.queue.push(info);

    // Play immediately if this is the only song in the queue
    if (this.queue.length === 1) this.processQueue();

    return 'Song successfully queued!';
  }

  /**
   * Process the playback queue
   */
  processQueue() {
    // If the queue is empty, nope out
    if (!this.queue.length) return this.disconnect();

    // Don't play if we aren't in a channel or don't have a dispatcher
    if (!this.currentConnection) return;

    // Get the next in line playback item
    let nextItem = this.queue[0];

    // Begin playback
    this.dispatch = this.currentConnection.playStream(
      youtubedl(nextItem.url, ['-x', '--audio-quality', '0']), { volume: this.volume * 0.01 }
    );

    this.dispatch.setBitrate('auto');

    // Assign callbacks
    this.dispatch.on('error', () => {
      this.queue.shift();
      this.processQueue();
    });

    this.dispatch.on('end', () => setTimeout(() => {
      this.queue.shift();
      this.processQueue();
    }));
  }

  /** Pauses any currently playing audio */
  pause() {
    if (this.currentConnection && this.dispatch) this.dispatch.pause();
  }

  /** Resumes previously paused playback */
  resume() {
    if (this.currentConnection && this.dispatch && this.dispatch.paused) this.dispatch.resume();
  }

  /** Skips the currently playing item */
  skip() {
    if (this.currentConnection && this.dispatch) this.dispatch.end();
  }

  /** Returns a formatted message containing all items in the queue */
  getQueueAsMessage() {
    if (!this.queue.length) return 'Queue is empty!';

    // Set up a stringydoo
    let currentQueueMessage = 'Current playback queue:\n';

    // Iterate over the queue
    this.queue.forEach((item, i) => currentQueueMessage += `${i + 1}: ${item.title}\n`);

    // Supply the result
    return currentQueueMessage;
  }

  /**
   * Sets new volume for playback, returns string message of operation result
   * @param volume Number between 0 - 100, exclusive
   */
  setVolume(volume: string | number) {
    volume = typeof volume === 'string' ? parseFloat(volume) : volume;

    // Make sure the number we have is within 0 - 100 and is an actual number
    if (isNaN(volume) || (volume < 0 || volume > 100)) return 'Invalid value for volume!';

    this.volume = volume;
    if (this.dispatch) this.dispatch.setVolume(volume * 0.01);

    return `Volume set to ${volume}!`;
  }

  /** Disconnects any existing voice connections and dumps the queue */
  kick() {
    this.disconnect();
    this.queue = [];
  }

  /** Disconnects the bot from the current voice connection, if exists */
  disconnect() {
    if (this.currentConnection) {
      this.currentConnection.disconnect();
      this.currentConnection = undefined;
    }
  }

  /**
   * Determines if a user is connected to a voice channel. Returns the voice channel
   * if present, otherwise false.
   * @param member Discord guild member
   */
  validateVoiceConnection(member: GuildMember): boolean | VoiceChannel {
    return member && member.voiceChannel;
  }
}
