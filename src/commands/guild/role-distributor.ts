import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  GuildMember,
  SlashCommandBuilder
} from 'discord.js';
import { detectStaff } from '@/misc/discord-utils.js';
import { config } from '@/data/config.js';

const command = new SlashCommandBuilder()
.setName('role-distributor')
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
}

const roleButtons: RoleButton[] = [
  {
    id: 'roles_hehim',
    label: 'He/Him',
    role: config.discordIds.roles.pronouns.heHim
  },
  {
    id: 'roles_sheher',
    label: 'She/Her',
    role: config.discordIds.roles.pronouns.sheHer
  },
  {
    id: 'roles_theythem',
    label: 'They/Them',
    role: config.discordIds.roles.pronouns.theyThem
  },
  {
    id: 'roles_ask',
    label: 'Ask',
    role: config.discordIds.roles.pronouns.ask
  }
];

export const cmd: BotCommand = {
  command,
  execute: async interaction => {
    if (!!interaction.inGuild() || !interaction.guild) return;
    if (!interaction.channel || !interaction.member) return;
    if (detectStaff(interaction.member) !== 'admin') {
      await interaction.reply({
        content: `You don't have permission to do that!`,
        ephemeral: true
      });

      return;
    }

    const text = interaction.options.getString('text', true);

    await interaction.reply({
      content: text,
      components: [
        new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          ...roleButtons.map(roleButton =>
            new ButtonBuilder()
            .setCustomId(roleButton.id)
            .setLabel(roleButton.label)
            .setStyle(ButtonStyle.Primary)
          )
        )
      ]
    });
  },
  button: {
    ids: roleButtons.map(roleButton => roleButton.id),
    execute: async interaction => {
      const roleButton = roleButtons.find(roleButton => roleButton.id === interaction.customId);
      if (!roleButton || !interaction.member || !interaction.guild) return;

      const role = await interaction.guild.roles.fetch(roleButton.role);
      if (!role) return;

      await interaction.deferReply({ ephemeral: true });
      
      if (!(interaction.member instanceof GuildMember)) return;
      const member = await interaction.member.fetch();
      
      const memberAlreadyHasRole = member.roles.cache.has(role.id);
      if (memberAlreadyHasRole) {
        await member.roles.remove(role);
      } else {
        await member.roles.add(role);
      }

      await interaction.editReply({
        content: memberAlreadyHasRole ?
          `The '${role.name}' role has been removed!` :
          `You have been given the '${role.name}' role!`
      });
    }
  }
};
