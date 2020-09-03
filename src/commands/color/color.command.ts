import { Message } from 'discord.js';
import { prefixedCommandRuleTemplate } from '../../config';
import { Command, CommandClass } from '../../shared';

@Command({
  matches: ['#'],
  ...prefixedCommandRuleTemplate,
  dontAppendSpace: true
})
export class ColorCommand implements CommandClass {

  constructor() {
    // Initialization code here, if any (constructor can be removed if not needed)
  }

  /**
   * Command action
   * @param msg Original discord message
   * @param args Message contents, split on space character
   */
  action(msg: Message, args: string[]) {
    //
  }

  /**
   * Command validation action, can be removed if not needed
   * @param msg Original discord message
   * @param args Message contents, split on space character
   */
  pre(msg: Message, args: string[]) {
    // By returning true, we signify that validation has passed, causing the action to trigger
    return true;
  }
}
