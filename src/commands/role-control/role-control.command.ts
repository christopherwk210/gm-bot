import { Message, Role } from 'discord.js';
import { prefixedCommandRuleTemplate } from '../../config';
import { Command, CommandClass, roleService } from '../../shared';

@Command({
  matches: ['role', '3d', 'voip'],
  ...prefixedCommandRuleTemplate
})
export class RoleControlCommand implements CommandClass {
  voipRole: Role;
  threedRole: Role;

  constructor() {
    this.voipRole = roleService.getRoleByID('275366872189370369');
    this.threedRole = roleService.getRoleByID('379657591657201674');
  }

  /**
   * Toggles a user role
   * @param msg 
   * @param args 
   */
  action(msg: Message, args: string[]) {
    switch (args[0].toLowerCase()) {
      case '!3d':
        return this.action(msg, ['!role', '3d']);
      case '!voip':
        return this.action(msg, ['!role', 'voip']);
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
    let role;

    // Ensure there is a role passed
    if (roleName[0]) {
      switch (roleName[0].toUpperCase()) {
        case 'VOIP':
          role = this.voipRole;
          break;
        case '3D':
          role = this.threedRole;
          break;
        default:
          msg.author.send('That is not a valid role');
          return;
      }
    }

    // If they've got the role
    if (msg.member.roles.has(role.id)) {
      // Remove it
      msg.member.removeRole(role);

      // Report it
      msg.author.send(`Role ${role.name} was removed.`);
    } else {
      // Otherwise, add it
      msg.member.addRole(role);

      // Tell em
      msg.author.send(`Role ${role.name} has been granted.`);
    }
  }
}
