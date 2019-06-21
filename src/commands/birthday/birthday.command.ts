import { Message } from 'discord.js';
import { prefixedCommandRuleTemplate } from '../../config';
import { Command, CommandClass, detectStaff, birthdayService } from '../../shared';

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
    let mention;

    if (msg.mentions.members) {
      mention = msg.mentions.members.first();
    }

    const ending = args.includes('end');

    if (!ending && detectStaff(msg.member)) {

      // staff added a birthday
      if (mention !== undefined) {
        birthdayService.addBirthday(mention);
      } else {
        msg.author.send('Could not find specified user for birthday command');
      }

    } else if (ending) {

      if (detectStaff(msg.member) && mention !== undefined) {
        // staff targeted a user to remove birthday from
        birthdayService.removeBirthday(mention);
      } else {
        // remove self birthday (doesn't do anything if no birthday)
        birthdayService.removeBirthday(msg.author);
      }

    }

  }
}
