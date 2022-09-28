import { client } from '../singletons/client.js';
import { config } from '../singletons/config.js';

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
