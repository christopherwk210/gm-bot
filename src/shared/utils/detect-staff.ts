import { GuildMember, User } from 'discord.js';
import { guildService } from '..';

import { serverIDs } from '../../config';

/**
 * Detects if a member is staff or not
 * @param member
 */
export function detectStaff(member: GuildMember): 'admin' | 'code' | 'art' | 'audio' | 'cats' | false {
  if (!member || !member.roles) return false;
  if (member.id === '144913457429348352') return 'admin'; // Allow toph through for testing reasons
  if (member.roles.cache.has(serverIDs.roles.serverStaff)) return 'admin';
  if (member.roles.cache.has(serverIDs.roles.duckyCodeRoleID) || member.roles.cache.has(serverIDs.roles.duckyHonouraryRoleID)) return 'code';
  if (member.roles.cache.has(serverIDs.roles.duckyArtRoleID)) return 'art';
  if (member.roles.cache.has(serverIDs.roles.duckyAudioRoleID)) return 'audio';
  if (member.roles.cache.has(serverIDs.roles.communityCatsRoleID)) return 'cats';

  return false;
}

/**
 * Fetches a user's /r/GameMaker guild membership if it exists,
 * and runs detectStaff against it
 * @param user
 */
export function detectOutsideStaff(user: User): 'admin' | 'code' | 'art' | 'audio' | 'cats' | false {
  if (!user || user.bot) return false;
  if (!user.client.guilds.cache.has(guildService.guild.id)) return false;

  // Get the /r/GM guild
  let userGuild = user.client.guilds.cache.get(guildService.guild.id);
  if (!userGuild) return false;

  // Get this users guild membership
  let guildMember = userGuild.members.cache.get(user.id);
  if (!guildMember) return false;

  return detectStaff(guildMember);
}
