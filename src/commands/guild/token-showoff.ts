import { SlashCommandBuilder } from 'discord.js';
import { db } from '@/database/db.js';

const command = new SlashCommandBuilder()
.setName('token-showoff')
.setDescription(`Show off your token balance to the world!`)

export const cmd: BotCommand = {
  command,
  execute: async interaction => {
    if (!interaction.inGuild() || !interaction.guild) return;
    await interaction.deferReply({ ephemeral: false });

    const interactionMember = await interaction.guild.members.fetch({ user: interaction.user.id }).catch(() => {});

    let checkingName = interactionMember ? interactionMember.displayName : interaction.user.username;
    let checkingId = interaction.user.id;

    const balance = await db.userToken.getUserTokens(checkingId).catch(() => null);
    if (balance === null) {
      await interaction.editReply({
        content: `${checkingName} has... uh... some amount of tokens? Idk there was an error checking the database. Idk. Sorry.`
      });
      return;
    } else {
      await interaction.editReply({
        content: `${checkingName} has ${balance === 1 ? `${balance} token!` : `${balance} tokens!`}`
      });
      return;
    }
  }
};
