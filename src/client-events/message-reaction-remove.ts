import { config } from '@/data/config.js';
import { db } from '@/database/db.js';
import { MessageReaction, PartialMessageReaction, PartialUser, User } from 'discord.js';

export async function onMessageReactionRemove(reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) {
  await handleRoleDistributorReacts(reaction, user);
}

async function handleRoleDistributorReacts(reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) {
  if (!reaction.message.inGuild()) return;
  const guild = reaction.message.guild;
    
  const isReactMessage = await db.roleDistributorReactMessage.exists(reaction.message.id);
  if (!isReactMessage) return;

  const member = await guild.members.fetch({ user: user.id }).catch(() => {});
  if (!member) return;

  const emojiId = reaction.emoji.id;
  if (!emojiId) return;

  let role = '';
  if (config.discordIds.emojis.hehim.includes(emojiId)) {
    role = config.discordIds.roles.pronouns.heHim;
  } else if (config.discordIds.emojis.sheher.includes(emojiId)) {
    role = config.discordIds.roles.pronouns.sheHer;
  } else if (config.discordIds.emojis.theythem.includes(emojiId)) {
    role = config.discordIds.roles.pronouns.theyThem;
  } else if (config.discordIds.emojis.ask.includes(emojiId)) {
    role = config.discordIds.roles.pronouns.ask;
  }

  if (!role) return;

  const guildRole = await guild.roles.fetch(role).catch(() => null);
  if (!guildRole) return;

  const success = await member.roles.remove(guildRole).catch(() => {});
  if (!success) return;

  await member.send({
    content: `Your '${guildRole.name}' role has been removed!`
  });
}
