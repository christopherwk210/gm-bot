import { EmbedBuilder, SlashCommandBuilder, TextChannel } from 'discord.js';
import { config } from '@/data/config.js';
import { moveChannelToUnbusy } from '@/misc/help-channel-ticker.js';

const command = new SlashCommandBuilder()
.setName('done')
.setDescription(`Marks this channel as not busy (help channels only!)`)

export const cmd: BotCommand = {
  command,
  execute: async interaction => {
    if (!interaction.inGuild() || !interaction.guild || !interaction.channel) return;
    if (config.discordIds.channels.helpChannels.includes(interaction.channelId)) {
      const embed = new EmbedBuilder()
      .setColor(config.defaultEmbedColor)
      .setDescription(`This channel is now available for another question ${config.discordIds.emojis.duckycode}`)
      .setTimestamp(new Date())

      await interaction.reply({ embeds: [embed] });

      const channel = await interaction.channel.fetch();
      await moveChannelToUnbusy(channel as TextChannel);
    } else {
      await interaction.reply({
        content: 'This command can only be used in a help channel!',
        ephemeral: true
      });
    }
  }
};
