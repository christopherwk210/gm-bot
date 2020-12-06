import { helpChannelBusyTimeout, serverIDs } from '../../config';
import { channelService } from '../';
import { GuildChannel, Message } from 'discord.js';

/**
 * Handles renaming the help channels when they're busy.
 */
class HelpChannelService {
  regex = /(?<=\d)[_]+busy$/g;
  helpChannels: HelpChannelController[] = [];

  handleMessage(msg: Message) {
    // console.log('DONE TRIGGER');

    const helpChannelController = this.helpChannels.find(
      controller => controller.id === msg.channel.id
    );

    // If it's not a help channel, we don't need to be here
    if (!helpChannelController) {
      // console.log('no help channel controller found');
      // console.log('channel info', msg.channel.id);
      return;
    }

    // console.log('busy status', helpChannelController.busy);

    // Mark a channel as busy if it isn't already, otherwise re-up the timer
    if (!helpChannelController.busy) {

      // Quick exit if the message was '!done' and a non-ducky was attemping
      if (msg.content.indexOf('!done') === 0) {
        // console.log('no done!');
        return;
      }

      helpChannelController.busy = true;

      // Set the channel name to busy
      // console.log('set busy');
      const currentName = helpChannelController.channel.name;
      helpChannelController.channel.setName(
        `${currentName.replace(this.regex, '')}__busy`
      );

      helpChannelController.culprit = msg.author.id;

      this.createChannelControllerTimeout(helpChannelController);
    } else {
      this.createChannelControllerTimeout(helpChannelController);
    }
  }

  /**
   * Marks a help channel as not busy
   * @param id Help channel ID
   */
  markNotBusy(id: string) {
    const helpChannelController = this.helpChannels.find(
      controller => controller.id === id
    );

    if (helpChannelController) {
      const currentName = helpChannelController.channel.name;
      console.log('set help channel name', currentName);
      helpChannelController.channel.setName(
        currentName.replace(this.regex, '')
      );
      console.log('set help channel success', helpChannelController.channel);

      clearTimeout(helpChannelController.timer);

      helpChannelController.busy = false;
      helpChannelController.culprit = '';
    } else {
      console.log('no controller found for done', id, this.helpChannels.map(c => {
        return {
          ...c,
          channel: undefined,
          timer: undefined
        };
      }));
    }
  }

  /**
   * Get
   */
  cacheHelpChannels() {
    serverIDs.channels.helpChannelIDs.forEach(channelID => {
      this.addHelpChannel(channelID);
    });
  }

  /**
   * Adds a channel to track as a help channel
   * @param id Help TextChannel ID
   */
  addHelpChannel(id: string) {
    const helpChannel = channelService.getChannelByID(id);
    const busyStatus = helpChannel.name.includes('__busy');
    const helpChannelController = {
      id,
      timer: -1,
      channel: helpChannel,
      culprit: '',
      busy: busyStatus
    };

    this.helpChannels.push(helpChannelController);
    if (busyStatus) this.createChannelControllerTimeout(helpChannelController);
  }

  /**
   * Creates a timer for the given controller and assigns it
   * @param controller
   */
  createChannelControllerTimeout(controller: HelpChannelController) {
    clearTimeout(controller.timer);

    const currentName = controller.channel.name;

    controller.timer = setTimeout(() => {
      controller.channel.setName(currentName.replace(this.regex, ''));
      controller.busy = false;
    }, helpChannelBusyTimeout);
  }
}

interface HelpChannelController {
  /** Channel ID */
  id: string;

  /** setTimeout reference for this channel */
  timer: any;

  /** GuildChannel reference */
  channel: GuildChannel;

  /** Who made the channel busy in the first place */
  culprit: string;

  /** Whether this channel is marked as busy or not */
  busy: boolean;
}

export let helpChannelService = new HelpChannelService();
