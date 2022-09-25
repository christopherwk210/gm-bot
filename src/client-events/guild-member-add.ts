import { GuildMember } from 'discord.js';
import { getTextChannel } from '../discord-utils.js';
import { config } from '../singletons/config.js';

export async function onGuildMemberAdd(member: GuildMember) {
  const securityChannel = await getTextChannel(config.discordIds.channels.securityChannel);
  if (!securityChannel) return;

  securityChannel.send({
    content: `${member.displayName}, tag: ${member} has joined.`
  });
}
