import {
  SlashCommandBuilder
} from 'discord.js';
import { detectStaff } from '@/misc/discord-utils.js';
import { config } from '@/data/config.js';
import { db } from '@/database/db.js';

const command = new SlashCommandBuilder()
.setName('role-distributor-react')
.setDescription(`Setup the role distribution message right here`)
.addStringOption(option =>
  option
  .setName('text')
  .setDescription('The text you want in the message')
  .setRequired(true)
);

interface RoleButton {
  id: string;
  label: string;
  role: string;
  emoji: string;
}

const roleButtons: RoleButton[] = [
  {
    id: 'roles_hehim',
    label: 'He/Him',
    role: config.discordIds.roles.pronouns.heHim,
    emoji: config.discordIds.emojis.hehim
  },
  {
    id: 'roles_sheher',
    label: 'She/Her',
    role: config.discordIds.roles.pronouns.sheHer,
    emoji: config.discordIds.emojis.sheher
  },
  {
    id: 'roles_theythem',
    label: 'They/Them',
    role: config.discordIds.roles.pronouns.theyThem,
    emoji: config.discordIds.emojis.theythem
  },
  {
    id: 'roles_ask',
    label: 'Ask',
    role: config.discordIds.roles.pronouns.ask,
    emoji: config.discordIds.emojis.ask
  }
];

export const cmd: BotCommand = {
  command,
  execute: async interaction => {
    if (!interaction.inGuild() || !interaction.guild) return;
    if (!interaction.channel || !interaction.member) return;
    if (detectStaff(interaction.member) !== 'admin') {
      await interaction.reply({
        content: `You don't have permission to do that!`,
        ephemeral: true
      });

      return;
    }

    await interaction.deferReply({ ephemeral: true });

    const text = interaction.options.getString('text', true);
    const content = `${text}\n\n` + roleButtons.map(btn => {
      return `${btn.emoji} - ${btn.label}`;
    }).join('\n');

    const message = await interaction.channel.send({
      content
    });
    
    for (const btn of roleButtons) {
      await message.react(btn.emoji);
    }

    await db.roleDistributorReactMessage.create(message.id);

    await interaction.editReply({
      content: 'Done! You may dismiss this message.'
    });
  }
};
