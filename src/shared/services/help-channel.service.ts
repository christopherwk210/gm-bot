import { helpChannelBusyTimeout } from '../../config';
import { channelService } from '../';
import { GuildChannel, TextChannel, Message } from 'discord.js';

/**
 * Handles renaming the help channels when they're busy.
 */
class HelpChannelService {
  helpChannels: HelpChannelController[] = [];

  handleMessage(msg: Message) {
    const helpChannelController = this.helpChannels.find(controller => controller.id === msg.channel.id);

    // If it's not a help channel, we don't need to be here
    if (!helpChannelController) return;

    // Mark a channel as busy if it isn't already, otherwise re-up the timer
    if (!helpChannelController.busy) {
      helpChannelController.busy = true;

      const currentName = helpChannelController.channel.name;
      helpChannelController.channel.setName(`${currentName.replace('_busy', '').replace('__busy', '')}_busy`);

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
    const helpChannelController = this.helpChannels.find(controller => controller.id === id);

    if (helpChannelController) {
      const currentName = helpChannelController.channel.name;
      helpChannelController.channel.setName(currentName.replace('_busy', '').replace('__busy', ''));

      clearTimeout(helpChannelController.timer);

      helpChannelController.busy = false;
    }
  }

  cacheHelpChannels() {
    this.addHelpChannel('262836222089625602');
    this.addHelpChannel('295210810823802882');
    this.addHelpChannel('331106795378442240');
    this.addHelpChannel('424619731077824532');
  }

  /**
   * Adds a channel to track as a help channel
   * @param id Help TextChannel ID
   */
  addHelpChannel(id: string) {
    const helpChannel = channelService.getChannelByID(id);

    this.helpChannels.push({
      id,
      timer: -1,
      channel: helpChannel,
      busy: false
    });
  }

  /**
   * Creates a timer for the given controller and assigns it
   * @param controller 
   */
  createChannelControllerTimeout(controller: HelpChannelController) {
    clearTimeout(controller.timer);

    const currentName = controller.channel.name;

    controller.timer = setTimeout(() => {
      controller.channel.setName(currentName.replace('_busy', ''));
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

  /** Whether this channel is marked as busy or not */
  busy: boolean;
}

export let helpChannelService = new HelpChannelService();
