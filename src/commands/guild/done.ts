import {
  CacheType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder
} from 'discord.js';
import { helpChannelSetUnbusy } from '../../message-handlers/help-channel-handler.js';
import { config } from '../../singletons/config.js';

const command = new SlashCommandBuilder()
.setName('done')
.setDescription(`Marks this channel as not busy (help channels only!)`)

async function execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<any> {
  if (!interaction.guild) return;
  const success = await helpChannelSetUnbusy(interaction.channelId);
  if (success) {
    const embed = new EmbedBuilder()
    .setColor(config.defaultEmbedColor)
    .setDescription(`This channel is now available for another question ${config.discordIds.emojis.duckycode}`)
    .setTimestamp(new Date())

    await interaction.reply({ embeds: [embed] });
  } else {
    await interaction.reply({
      content: 'This command can only be used in a help channel!',
      ephemeral: true
    });
  }
}

export const cmd: BotCommand = {
  command,
  execute
};
