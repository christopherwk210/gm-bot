import { roleService } from '../services/role.service';
import { GuildMember, User } from 'discord.js';
import { guildService } from '..';

/**
 * Detects if a member is staff or not
 * @param member
 */
export function detectStaff(member: GuildMember): 'admin' | 'code' | 'art' | 'audio' | false {
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
}

/**
 * Fetches a user's /r/GameMaker guild membership if it exists,
 * and runs detectStaff against it
 * @param user 
 */
export function detectOutsideStaff(user: User): 'admin' | 'code' | 'art' | 'audio' | false {
  if (user.bot) return false;
  if (!user.client.guilds.has(guildService.guild.id)) return false;

  // Get the /r/GM guild
  let userGuild = user.client.guilds.get(guildService.guild.id);
  if (!userGuild) return false;

  // Get this users guild membership
  let guildMember = userGuild.members.get(user.id);
  if (!guildMember) return false;

  return detectStaff(guildMember);
}
