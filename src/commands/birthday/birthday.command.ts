import { Message } from 'discord.js';
import { prefixedCommandRuleTemplate } from '../../config';
import { Command, CommandClass } from '../../shared';

@Command({
  matches: ['birthday'],
  ...prefixedCommandRuleTemplate
})
export class BirthdayCommand implements CommandClass {
  /**
   * assigns birthday to someone
   * @param msg
   * @param args
   */
  action(msg: Message, args: string[]) {
    // done in server
    if (msg.guild) {
      // done in server, must be admin
      if (detectStaff(msg.member)) {
        let member = msg.mentions.members.first();
        if (member) {
          // do the birthday thing
          if (args.indexOf('end') === -1) {
            console.log("birthday on " + member.displayName);
          }
          else {
            console.log("birthday ended for " + member.displayName);
          }
        }
        else {
          msg.author.send('Colud not find specified user for birthday command');
        }
      }
    } else if (msg.member) {
      if (args.indexOf('end') !== -1) {
        // check if valid birthday and then end it
        console.log("birthday ended for " + msg.member.displayName)
      }
    }
  }
}
