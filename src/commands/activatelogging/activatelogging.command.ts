import { Message } from 'discord.js';
import { prefixedCommandRuleTemplate } from '../../config';
import { Command, CommandClass } from '../../shared';
import { docService } from '../../shared/services/doc.service';

@Command({
  matches: ['startFailLogs'],
  ...prefixedCommandRuleTemplate
})
export class ActivateLoggingCommand implements CommandClass {

  /**
   * Enables or disables the sending of messages to Dingus_bot_testing when !docs can't find a function.
   * @param msg Original discord message
   * @param args Message contents, split on space character
   */
  action(msg: Message, args: string[]) {
    docService.currentlyLogging = !docService.currentlyLogging;
    if (docService.currentlyLogging) {
      msg.channel.send('The doc logger is now active.');
    } else if (!docService.currentlyLogging) {
      msg.channel.send('The doc logger is now inactive.');
    } else {
      msg.channel.send('Things are seriously broken.');
    }
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
