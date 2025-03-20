import { GuildMember, SlashCommandBuilder } from 'discord.js';
import { db } from '@/database/db.js';

const command = new SlashCommandBuilder()
.setName('token-balance')
.setDescription(`Check the token balance of a user (or yourself)`)
.addMentionableOption(option =>
  option
  .setName('member')
  .setDescription('The member you want to check the balance of (leave blank for yourself)')
  .setRequired(false)
);

export const cmd: BotCommand = {
  command,
  execute: async interaction => {
    if (!interaction.inGuild() || !interaction.guild) return;
    await interaction.deferReply({ ephemeral: true });

    let checkingName = '';
    let checkingId = interaction.user.id;
    let checkingSelf = true;

    const member = interaction.options.getMentionable('member');
    if (member) {
      if (member instanceof GuildMember) {
        const fetchedMember = await member.fetch();
        checkingId = fetchedMember.user.id;
        checkingName = fetchedMember.displayName;
        checkingSelf = false;
      } else {
        await interaction.editReply('You must provide a valid member!');
        return;
      }
    }

    const balance = await db.userToken.getUserTokens(checkingId).catch(() => null);
    if (balance === null) {
      await interaction.editReply({
        content: `I had a little uh-oh accessing the database. Maybe try it again and pretend this never happened.`
      });
      return;
    } else {
      await interaction.editReply({
        content: `${checkingSelf ? 'You have' : `${checkingName} has`} ${balance === 1 ? `${balance} token.` : `${balance} tokens.`}`
      });
      return;
    }
  }
};
