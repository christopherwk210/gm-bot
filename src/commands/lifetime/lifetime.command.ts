import { Message } from 'discord.js';
import { prefixedCommandRuleTemplate } from '../../config';
import { Command, CommandClass } from '../../shared';

@Command({
  matches: ['lifetime'],
  ...prefixedCommandRuleTemplate
})
export class LifetimeCommand implements CommandClass {
  /**
   * Tells the user how long they've belonged to the server
   * @param msg 
   * @param args
   */
  action(msg: Message, args: string[]) {
    if (args.length > 1) {
      if (msg.guild) {
        msg.guild.fetchMember(args[1].replace(/[<!@>]+/g, '')).then(member => {
          if (member) {
            msg.channel.send(`${member.displayName} has been a member of this server since ${member.joinedAt}.`);
          } else {
            msg.channel.send('Could not find specified user');
          }
        });
      } else {
        msg.channel.send('You can only use this in the /r/GameMaker server.');
      }
    } else if (msg.member) {
      msg.channel.send(`${msg.member.displayName}, you have been a member of this server since ${msg.member.joinedAt}.`);
    } else {
      msg.channel.send('You can only use this in the /r/GameMaker server.');
    }
  }
}
