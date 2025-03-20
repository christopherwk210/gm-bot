import { SlashCommandBuilder } from 'discord.js';
import { db } from '@/database/db.js';

const command = new SlashCommandBuilder()
.setName('token-tops')
.setDescription(`See who the wealthiest token holders are`);

export const cmd: BotCommand = {
  command,
  execute: async interaction => {
    if (!interaction.inGuild() || !interaction.guild) return;
    await interaction.deferReply({ ephemeral: true });

    const tops = await db.userToken.getTopFiveUsersWithMostTokensNotIncludingTopher().catch(() => {});
    if (!tops) {
      await interaction.editReply({
        content: `Oops, couldn't access the database. Try again later.`
      });
      return;
    }

    const message = tops.map((top, i) => {
      return `${i + 1}. <@${top.userId}>: ${top.tokens}`;
    }).join('\n');

    await interaction.editReply({
      content: `The top ${tops.length} token holders are:\n${message}`
    });
  }
};
