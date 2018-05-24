import { Message } from 'discord.js';
import { prefixedCommandRuleTemplate } from '../../config';
import { Command, CommandClass, detectStaff, markdownService } from '../../shared';

// Project data
const resources = markdownService.files['resources'];

@Command({
  matches: ['resources'],
  ...prefixedCommandRuleTemplate
})
export class ResourcesCommand implements CommandClass {
  /**
   * Will send resources to a user or given user if being sent by an admin or rubber duck
   * @param msg 
   * @param args 
   */
  action(msg: Message, args: string[]) {
    // If the author is an admin or duck
    if (detectStaff(msg.member)) {
      // If they have supplied an argument
      if (args[1]) {
        // And it's a valid member of the server
        let id = args[1].replace(/([<>@])/g, '');
        let user = msg.member.guild.members.get(id);

        if (user) {
          // Send them resources!
          user.send(resources);
        } else {
          // Whoops, no member found
          msg.author.send('An error occurred with your request... Did you mention a valid user?');
        }
      } else {
        // We don't want to send it to another user, send it to us
        msg.author.send(resources);
      }
    } else {
      // We can only mean ourselves!
      msg.author.send(resources);
    }
  }
}
