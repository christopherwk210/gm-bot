import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { config } from '@/data/config.js';

const command = new SlashCommandBuilder()
.setName('backtick')
.setDescription(`Shows you how to format a code block in Discord`);

export const cmd: BotCommand = {
  command,
  execute: async interaction => {
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
        .setTitle('You can format your code by encapsulating it within three backticks before and after')
        .setDescription('\n\\`\\`\\`\nshow_debug_message("I\'m formatted!");\n\\`\\`\\`\n\n' +
        'The above example displays:\n' +
        '```\nshow_debug_message("I\'m formatted!");\n```\n' +
        `The backtick key can be found above the TAB key on most keyboards.`)
        .setImage('https://cdn.discordapp.com/attachments/441976514289074201/456562731903090697/backtick.png')
        .setColor(config.defaultEmbedColor)
      ]
    });
  }
};
