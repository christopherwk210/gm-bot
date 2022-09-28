import { SlashCommandBuilder, TextBasedChannel } from 'discord.js';

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
    if (!interaction.guild || !interaction.channel) return;
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
