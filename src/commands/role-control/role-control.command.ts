import { Message, Role } from 'discord.js';
import { Command, CommandClass, roleService } from '../../shared';
import { prefixedCommandRuleTemplate, serverIDs } from '../../config';

@Command({
  matches: ['role'],
  ...prefixedCommandRuleTemplate
})
export class RoleControlCommand implements CommandClass {

  /**
   * Toggles a user role
   * @param msg
   * @param args
   */
  action(msg: Message, args: string[]) {
    msg.channel.send('The `!role` command is currently not used for anything. Sorry!');
  }
}
