import { roleService } from '../services/role.service';
import { GuildMember } from 'discord.js';

/**
 * Detects if a member is staff or not
 * @param member Discord.js GuildMember
 */
export function detectStaff(member: GuildMember): 'admin'|'code'|'art'|'audio'|false {
  let roles = {
    admin: '262835321694060547',
    subredditMods: '262843600730062849',
    rubberDuckies: '262926334118985728',
    honouraryDuckies: '390437904859660290',
    artDuckies: '345222078577901569',
    audioDuckies: '398875444360904704'
  };

  if (!member || !member.roles) return false;
  if (member.roles.has(roles.admin) || member.roles.has(roles.subredditMods)) return 'admin';
  if (member.roles.has(roles.rubberDuckies) || member.roles.has(roles.honouraryDuckies)) return 'code';
  if (member.roles.has(roles.artDuckies)) return 'art';
  if (member.roles.has(roles.audioDuckies)) return 'audio';

  return false;
};
