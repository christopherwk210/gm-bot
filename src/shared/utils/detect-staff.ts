import { roleService } from '../services/role.service';
import { GuildMember, User } from 'discord.js';
import { guildService } from '..';

import { serverIDs } from '../../config';

/**
 * Detects if a member is staff or not
 * @param member
 */
export function detectStaff(member: GuildMember): 'admin' | 'code' | 'art' | 'audio' | false {
  if (!member || !member.roles) return false;
  if (member.roles.has(serverIDs.adminRoleID) || member.roles.has(serverIDs.subredditmodsRoleID)) return 'admin';
  if (member.roles.has(serverIDs.duckycodeRoleID) || member.roles.has(serverIDs.duckyhonouraryRoleID)) return 'code';
  if (member.roles.has(serverIDs.duckyartRoleID)) return 'art';
  if (member.roles.has(serverIDs.duckyaudioRoleID)) return 'audio';

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
