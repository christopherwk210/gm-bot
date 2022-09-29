import { SlashCommandBuilder, TextBasedChannel } from 'discord.js';
import { detectStaff } from '@/misc/discord-utils.js';

const command = new SlashCommandBuilder()
.setName('say')
.setDescription(`Send a message as the bot`)
.addStringOption(option =>
  option
  .setName('message')
  .setDescription('The message you want to send')
  .setRequired(true)
)
.addChannelOption(option =>
  option
  .setName('destination')
  .setDescription('The channel you want to send the message to')
  .setRequired(false)
)

export const cmd: BotCommand = {
  command,
  execute: async interaction => {
    if (!!interaction.inGuild() || !interaction.guild) return;
    if (!interaction.channel || !interaction.member) return;
    if (detectStaff(interaction.member) !== 'admin') {
      await interaction.reply({
        content: `You don't have permission to do that!`,
        ephemeral: true
      })
      return;
    }

    const message = interaction.options.getString('message', true);
    const channel = interaction.options.getChannel('destination', false) || interaction.channel;

    if ((channel as TextBasedChannel).send) {
      await interaction.deferReply({ ephemeral: true });
      await (channel as TextBasedChannel).send({ content: message });
      await interaction.editReply({ content: 'Message sent!' });
    } else {
      await interaction.reply({
        content: `Your message wasn't sent. Are you sure you selected a text based channel?`,
        ephemeral: true
      });
    }
  }
};
