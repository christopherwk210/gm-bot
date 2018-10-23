import { Message } from 'discord.js';
import { prefixedCommandRuleTemplate } from '../../config';
import { Command, CommandClass, detectStaff, helpChannelService, guildService } from '../../shared';

@Command({
  matches: ['done'],
  ...prefixedCommandRuleTemplate
})
export class DoneCommand implements CommandClass {
  /**
   * Marks a help channel as no longer read-only
   * @param msg Original discord message
   * @param args Message contents, split on space character
   */
  action(msg: Message, args: string[]) {
    helpChannelService.markNotBusy(msg.channel.id);

    if (args.includes('silent') || args.includes('s')) return;

    const possibleEmoji = guildService.guild.emojis.find(emoji => emoji.name === 'duckydevil');
    const sirQuackers = possibleEmoji !== null ? possibleEmoji : '';
    msg.channel.send(`This question has been cast into the abyss; let another inquiry be brought forward ${sirQuackers}`);
  }

  /**
   * Command validation action
   * @param msg Original discord message
   * @param args Message contents, split on space character
   */
  pre(msg: Message, args: string[]) {
    const helpChannelController = helpChannelService.helpChannels.find(controller => controller.id === msg.channel.id);
    return !!detectStaff(msg.member) || (helpChannelController !== undefined && helpChannelController.culprit === msg.author.id);
  }
}
