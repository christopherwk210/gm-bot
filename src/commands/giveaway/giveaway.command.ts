import { Message, GuildMember } from 'discord.js';
import { prefixedCommandRuleTemplate } from '../../config';
import { Command, CommandClass, giveawayService, Giveaway } from '../../shared';

@Command({
  matches: ['giveaway', 'giveaways'],
  ...prefixedCommandRuleTemplate
})
export class GiveawayCommand implements CommandClass {
  action(msg: Message, args: string[]) {
    let activeGiveaways = giveawayService.giveawayArray();

    switch (activeGiveaways.length) {
      case 0:
        return msg.member.send('There are no currently active giveaways!');
      case 1:
        this.signupMemberForGiveaway(activeGiveaways[0].name, msg.member);
        break;
      default:
        if (args.length === 1) return msg.member.send(this.createGiveawayListMessage(activeGiveaways));
        this.signupMemberForGiveaway(args[1], msg.member);
    }
  }

  /**
   * Ensures the command can only be accessed inside the server
   * @param msg 
   */
  pre(msg: Message) {
    return !!msg.member;
  }

  /**
   * Attempt to sign up a member for a giveaway, sending them a message of the result
   * @param giveawayName 
   * @param member 
   */
  signupMemberForGiveaway(giveawayName: string, member: GuildMember) {
    let result = giveawayService.signup(giveawayName, member);
    member.send(result ? result : `Thank you for signing up for the ${giveawayName} giveaway!`);
  }

  /**
   * Creates a formatted message containing all current giveaway names
   * @param activeGiveaways 
   */
  createGiveawayListMessage(activeGiveaways: Giveaway[]) {
    let nameList = activeGiveaways.map(giveaway => giveaway.name);
    let names = nameList.join(', ');
    return `Here is a list of the currently active giveaways:\n\`\`\`${names}\`\`\`\nType !giveaway \`name\` to sign up for one!`;
  }
}
