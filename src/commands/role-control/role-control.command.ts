import { Message, Role } from 'discord.js';
import { Command, CommandClass, roleService } from '../../shared';
import { prefixedCommandRuleTemplate, serverIDs } from '../../config';

@Command({
  matches: ['role', 'podcast'],
  ...prefixedCommandRuleTemplate
})
export class RoleControlCommand implements CommandClass {
  podcastRole: Role;

  constructor() {
    this.podcastRole = roleService.getRoleByID(serverIDs.roles.podcast);
  }

  /**
   * Toggles a user role
   * @param msg
   * @param args
   */
  action(msg: Message, args: string[]) {
    // throw it back for the dingus
    switch (args[0].toLowerCase()) {
      case '!podcast':
        return this.action(msg, ['!role', 'podcast']);
    }

    // Ensure we aren't in DM
    if ((msg.guild === null) || (msg.guild === undefined) || !msg.member) {
      msg.author.send(
        '`!role` does not work inside direct messages, and can sometimes fail when a user name has unicode characters in it.' +
        ' Please contact one of the admins if you need help with your role.'
      );
      return;
    }

    // Get the role from the argument
    let roleName = args.splice(1);
    let role: Role;

    // Ensure there is a role passed
    if (roleName[0]) {
      switch (roleName[0].toUpperCase()) {
        case 'PODCAST':
          role = this.podcastRole;
          break;
        default:
          msg.author.send('That is not a valid role');
          return;
      }
    }

    if (msg.member.roles.has(role.id)) {
      // kill the roll
      msg.member.removeRole(role);

      msg.author.send(`Role ${role.name} was removed.`);
    } else {
      // add it
      msg.member.addRole(role);

      // tell em
      if (role === this.podcastRole) {
        msg.author.send(
          `Thanks for signing up for obj_podcast notifications! You'll get a ping in the server 15 minutes before recordings begin.`
        );
      } else {
        msg.author.send(
          `Role ${role.name} has been granted.`
        );
      }
    }
  }
}
