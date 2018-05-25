import { roleService } from '../services/role.service';
import { GuildMember } from 'discord.js';

/**
 * Detects if a member is staff or not
 * @param member Discord.js GuildMember
 */
export function detectStaff(member: GuildMember): 'admin'|'rubber'|'art'|'audio'|false {
  let roles = {
    admin: roleService.getRoleByID('262835321694060547'),
    subredditMods: roleService.getRoleByID('262843600730062849'),
    rubberDuckies: roleService.getRoleByID('262926334118985728'),
    honouraryRubberDuckies: roleService.getRoleByID('390437904859660290'),
    artDuckies: roleService.getRoleByID('345222078577901569'),
    audioDuckies: roleService.getRoleByID('398875444360904704')
  };

  if ((!member) || (!member.roles)) {
    return false;
  } else if (member.roles.has(roles.admin.id) || member.roles.has(roles.subredditMods.id)) {
    return 'admin';
  } else if (member.roles.has(roles.rubberDuckies.id) || member.roles.has(roles.honouraryRubberDuckies.id)) {
    return 'rubber';
  } else if (member.roles.has(roles.artDuckies.id)) {
    return 'art';
  } else if (member.roles.has(roles.audioDuckies.id)) {
    return 'audio';
  } else {
    return false;
  }
};
