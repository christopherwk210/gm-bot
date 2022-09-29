import { APIInteractionGuildMember, GuildMember } from 'discord.js';
import { client } from '@/singletons/client.js';
import { config } from '@/data/config.js';

export function getGuild() {
  return client.guilds.fetch(config.discordIds.guildId);
}

export async function getTextChannel(id: string) {
  const guild = await getGuild();
  const channel = await guild.channels.fetch(id).catch(() => {});
  if (channel && channel.isTextBased()) return channel;
  return undefined;
}

const codeBlockRegExp = '```([a-z0-9\\._\\-+]*)(?:\\n|\\r)([\\s\\S]*?)\\n```';

/**
 * Parses a string for discord compatible markdown code blocks
 * @param str 
 * @param langFilter When provided, will filter results by language provided
 */
export function parseCodeBlocks(str: string, langFilter?: string) {
  const regExp = new RegExp(codeBlockRegExp, 'g');
  const results = [];
  
  let match: RegExpExecArray | null;
  while (match = regExp.exec(str)) {
    results.push({
      lang: match[1],
      code: match[2]
    });
  }

  if (langFilter) return results.filter(result => result.lang === langFilter);
  return results;
}

export function detectStaff(member: GuildMember | APIInteractionGuildMember) {
  if (member.user.id === '144913457429348352') return 'admin'; // Allow toph through for testing reasons

  if (Array.isArray(member.roles)) {
    if (member.roles.includes(config.discordIds.roles.duckyCodeRole) || member.roles.includes(config.discordIds.roles.duckyHonouraryRole)) return 'code';
    if (member.roles.includes(config.discordIds.roles.duckyArtRole)) return 'art';
    if (member.roles.includes(config.discordIds.roles.duckyAudioRole)) return 'audio';
    if (member.roles.includes(config.discordIds.roles.communityCatsRole)) return 'cats';
  } else {
    if (member.roles.cache.has(config.discordIds.roles.serverStaff)) return 'admin';
    if (member.roles.cache.has(config.discordIds.roles.duckyCodeRole) || member.roles.cache.has(config.discordIds.roles.duckyHonouraryRole)) return 'code';
    if (member.roles.cache.has(config.discordIds.roles.duckyArtRole)) return 'art';
    if (member.roles.cache.has(config.discordIds.roles.duckyAudioRole)) return 'audio';
    if (member.roles.cache.has(config.discordIds.roles.communityCatsRole)) return 'cats';
  }
  
  return false;
}
