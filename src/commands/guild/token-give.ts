import { GuildMember, SlashCommandBuilder } from 'discord.js';
import { db } from '@/database/db.js';
import { config } from '@/data/config.js';

const command = new SlashCommandBuilder()
.setName('token-give')
.setDescription(`Give tokens to a user from your balance`)
.addMentionableOption(option =>
  option
  .setName('member')
  .setDescription('The member you want to give tokens to')
  .setRequired(true)
)
.addNumberOption(option =>
  option
  .setName('amount')
  .setDescription('The amount of tokens you want to give (default 1)')
  .setRequired(false)
);

export const cmd: BotCommand = {
  command,
  execute: async interaction => {
    if (!interaction.inGuild() || !interaction.guild || !interaction.member) return;
    await interaction.deferReply({ ephemeral: true });

    // Validate member
    const member = interaction.options.getMentionable('member');
    if (!member || !(member instanceof GuildMember)) {
      await interaction.editReply('You must provide a valid member!');
      return;
    }

    if (member.partial) {
      try {
        await member.fetch();
      } catch (e) {
        await interaction.editReply(`I couldn't find that member. Maybe they left?`);
        return;
      }
    }

    // Validate amount
    const amount = interaction.options.getNumber('amount') || 1;
    if (amount < 1 || Math.floor(amount) !== amount) {
      await interaction.editReply(`C'mon dude. Be normal and put in a valid number.`);
      return;
    }

    let givingUserId = interaction.user.id;
    let receivingUserId = member.user.id;

    if (givingUserId === receivingUserId) {
      await interaction.editReply({
        content: `You can't give tokens to yourself!`
      }).catch(() => {});
      return;
    }
  
    let givingUserName = interaction.user.username;
    let givingUserMember = await interaction.guild.members.fetch({ user: givingUserId }).catch(() => {});
    if (givingUserMember) {
      givingUserName = givingUserMember.displayName;
    }
  
    let receivingUserName = member.user.username;
    let receivingUserMember = await interaction.guild.members.fetch({ user: receivingUserId }).catch(() => {});
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
    if (givingUserTokens - amount < 0) {
      await interaction.editReply({
        content: `You don't have enough tokens for that! Your balance is ${givingUserTokens} and you tried to give ${amount}.`
      }).catch(() => {});
      return;
    }
  
    // Don't give them to me lol
    if (receivingUserId === config.tophersId) {
      const possibleResponses = [
        `You tried giving a token to Topher, but he has enough already!`,
        `Give your tokens to someone else! Topher doesn't want any more.`,
        `Dude, Topher has enough tokens. Give them to someone else.`,
        `Topher has enough tokens. Give them to someone else.`,
        `Topher invented stupid tokens. He doesn't need them.`,
        `I don't think Topher deserves tokens, so I'm not giving him any. Give them to someone else.`,
        `I tried giving Topher one of your tokens, but he was being really rude about it? So I changed my mind. Give it to someone else I guess.`
      ];
  
      await interaction.editReply({
        content: possibleResponses[Math.floor(Math.random() * possibleResponses.length)]
      }).catch(() => {});
      return;
    }
  
    // Give them a token
    if (givingUserId !== config.tophersId) {
      try {
        await db.userToken.removeTokens(givingUserId, amount);
      } catch (e) {
        await interaction.editReply({
          content: `Something went wrong. Please try again later.`
        }).catch(() => {});
      }
    }
  
    try {
      await db.userToken.addTokens(receivingUserId, amount);
    } catch (e) {
      await interaction.editReply({
        content: `Something went wrong. Please try again later.`
      }).catch(() => {});
    }
  
    // Send a message to the giver
    await interaction.editReply({
      content: `You gifted ${amount === 1 ? `${amount} token` : `${amount} tokens`} to ${receivingUserName}! Your remaining balance is ${givingUserTokens - amount}.`
    }).catch(() => {});
  
    // Send a message to the receiver
    const receivingUserTokens = await db.userToken.getUserTokens(receivingUserId);
    const receivingUserTokensText = receivingUserTokens === 1 ? '1 token' : `${receivingUserTokens} tokens`;
    member.send({
      content: `${givingUserName} gave you ${amount === 1 ? `${amount} token` : `${amount} tokens`}! You now have ${receivingUserTokensText}.`
    }).catch(() => {});
  }
};
