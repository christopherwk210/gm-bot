import { EmbedBuilder, Message, TextChannel } from 'discord.js';
import { config } from '@/data/config.js';
import { moveChannelToUnbusy } from '@/misc/help-channel-ticker.js';

export async function handleHelpAnyDone(message: Message<boolean>) {
  if (
    message.inGuild() &&
    message.guildId === config.discordIds.guildId
    && config.discordIds.channels.helpChannels.includes(message.channelId)
  ) {
    if (message.content.startsWith('/')) {
      if (!message.content.includes(' ')) {
        const embed = new EmbedBuilder()
          .setColor(config.defaultEmbedColor)
          .setDescription(`This channel is now available for another question ${config.discordIds.emojis.duckycode}`)
          .setTimestamp(new Date())

        await (message.channel as TextChannel).send({embeds: [embed]});
        await moveChannelToUnbusy(message.channel as TextChannel);
      }
    }
  }
}
