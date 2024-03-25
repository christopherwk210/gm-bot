import { config } from '@/data/config.js';
import { db } from '@/database/db.js';
import { handleGMLCodeBlockMessages } from '@/message-handlers/gml-formatter.js';
import { MessageReaction, PartialMessageReaction, PartialUser, User } from 'discord.js';

export async function onMessageReactionAdd(reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) {
  if (reaction.partial) {
		try {
			await reaction.fetch();
		} catch (error) {
			console.error('Something went wrong when fetching the message:', error);
			return;
		}
	}

  if (reaction.message.partial) {
    try {
      await reaction.message.fetch();
    } catch (error) {
      console.error('Something went wrong when fetching the message:', error);
      return;
    }
  }

  if (user.partial) {
    try {
      await user.fetch();
    } catch (error) {
      console.error('Something went wrong when fetching the message:', error);
      return;
    }
  }

  await handleRoleDistributorReacts(reaction, user);
  await handleTokenReacts(reaction, user);
  await handleWandReacts(reaction, user);
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

  const success = await member.roles.add(guildRole).catch(() => {});
  if (!success) return;

  await member.send({
    content: `You have been given the '${guildRole.name}' role!`
  }).catch(() => {});
}

async function handleTokenReacts(reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) {
  if (!reaction.message.inGuild()) return;
  if (!config.discordIds.emojis.tophtoken.includes(reaction.emoji.id || 'NOEMOJIIDWASFOUND')) return;

  let givingUserId = user.id;
  let receivingUserId = reaction.message.author.id;

  if (givingUserId === receivingUserId) {
    user.send({
      content: `You can't give tokens to yourself!`
    }).catch(() => {});
    return;
  }

  let givingUserName = user.username;
  let givingUserMember = await reaction.message.guild.members.fetch({ user: givingUserId }).catch(() => {});
  if (givingUserMember) {
    givingUserName = givingUserMember.displayName;
  }

  let receivingUserName = reaction.message.author.username;
  let receivingUserMember = await reaction.message.guild.members.fetch({ user: receivingUserId }).catch(() => {});
  if (receivingUserMember) {
    receivingUserName = receivingUserMember.displayName;
  }

  let givingUserTokens = 0;
  if (givingUserId === config.tophersId) {
    givingUserTokens = 9999;
  } else {
    givingUserTokens = await db.userToken.getUserTokens(givingUserId);
  }

  // Ensure user has some to give
  if (givingUserTokens <= 0) {
    const possibleResponses = [
      `You tried giving out a token, but you don't have any to give!`,
      `You can't give out a token if you don't have any!`,
      `You don't have any tokens to give!`,
      `Stop trying to give out tokens you don't have!`,
      `You can't give out a token. You're broke. Sorry.`,
      `You're broke! No tokens to give. :(`
    ];

    user.send({
      content: possibleResponses[Math.floor(Math.random() * possibleResponses.length)]
    }).catch(() => {});
    return;
  }

  // Don't give them to me lol
  if (receivingUserId === config.tophersId) {
    const possibleResponses = [
      `You tried giving a token to Topher, but he has enough already!`,
      `Give your tokens to someone else! Topher can't have any more.`,
      `Dude, Topher has enough tokens. Give them to someone else.`,
      `Topher has enough tokens. Give them to someone else.`,
      `Topher invented stupid tokens. He doesn't need them.`,
      `I don't think Topher deserves tokens, so I'm not giving him any. Give them to someone else.`,
      `I tried giving Topher one of your tokens, but he was being really rude about it? So I changed my mind. Give it to someone else I guess.`
    ];

    user.send({
      content: possibleResponses[Math.floor(Math.random() * possibleResponses.length)]
    }).catch(() => {});
    return;
  }

  // Give them a token
  if (givingUserId !== config.tophersId) {
    try {
      await db.userToken.removeTokens(givingUserId, 1);
    } catch (e) {
      user.send({
        content: `Something went wrong when giving out a token. Please try again later.`
      }).catch(() => {});
    }
  }

  try {
    await db.userToken.addTokens(receivingUserId, 1);
  } catch (e) {
    user.send({
      content: `Something went wrong when giving out a token. Please try again later.`
    }).catch(() => {});
  }

  // Send a message to the giver
  user.send({
    content: `You gave a token to ${receivingUserName}! Your remaining balance is ${givingUserTokens - 1}.`
  }).catch(() => {});

  // Send a message to the receiver
  const receivingUserTokens = await db.userToken.getUserTokens(receivingUserId);
  const receivingUserTokensText = receivingUserTokens === 1 ? '1 token' : `${receivingUserTokens} tokens`;
  reaction.message.author.send({
    content: `${givingUserName} gave you a token! You now have ${receivingUserTokensText}.`
  }).catch(() => {});
}

async function handleWandReacts(reaction: MessageReaction | PartialMessageReaction, _user: User | PartialUser) {
  if (reaction.emoji.name !== '🪄' && reaction.emoji.name !== '🤢') return;
  debounceReaction(async () => {
    const message = await reaction.message.fetch();
    handleGMLCodeBlockMessages(message, true);
  }, reaction);
}

const activeReactMessages: string[] = [];
function debounceReaction(callback: () => any, reaction: MessageReaction | PartialMessageReaction, time = 1000) {
  const messageId = reaction.message.id;
  if (activeReactMessages.includes(messageId)) return;

  callback();
  activeReactMessages.push(messageId);
  setTimeout(() => {
    activeReactMessages.splice(activeReactMessages.indexOf(messageId), 1);
  }, time);
}