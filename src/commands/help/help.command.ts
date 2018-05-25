import { Message } from 'discord.js';
import { prefixedCommandRuleTemplate } from '../../config';
import { Command, CommandClass, detectStaff, markdownService } from '../../shared';

@Command({
  matches: ['help'],
  ...prefixedCommandRuleTemplate
})
export class HelpCommand implements CommandClass {
  helpFiles: any = {};

  constructor() {
    this.helpFiles.admins = markdownService.files['help.admins'];
    this.helpFiles.ducks = markdownService.files['help.ducks'];
    this.helpFiles.ducksContinued = markdownService.files['help.ducks.cont'];
    this.helpFiles.all = markdownService.files['help.all'];
  }

  /**
   * Will send proper help messages
   * @param msg 
   * @param args 
   */
  action(msg: Message, args: string[]) {
    let command;

    // Determine the correct help message to deliver
    if ((msg.member)) {
      command = detectStaff(msg.member);
    }

    // Deliver the proper message
    switch (command) {
      case 'admin':
        msg.author.send(this.helpFiles.admins);
      case 'art':
      case 'rubber':
      case 'audio':
        msg.author.send(this.helpFiles.ducks);
        msg.author.send(this.helpFiles.ducksContinued);
      default:
        msg.author.send(this.helpFiles.all);
    }
  }
}
