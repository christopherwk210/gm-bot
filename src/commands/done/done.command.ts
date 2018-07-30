import { Message } from 'discord.js';
import { prefixedCommandRuleTemplate } from '../../config';
import { Command, CommandClass, detectStaff, helpChannelService } from '../../shared';

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
  }

  /**
   * Command validation action
   * @param msg Original discord message
   * @param args Message contents, split on space character
   */
  pre(msg: Message, args: string[]) {
    return !!detectStaff(msg.member);
  }
}
