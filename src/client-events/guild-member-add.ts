import { EmbedBuilder, GuildMember } from 'discord.js';
import { getTextChannel } from '@/misc/discord-utils.js';
import { config } from '@/data/config.js';

const welcomeMessage =
`__**Welcome to the GameMaker Discord server!**__

Thanks for joining! **Please read the #rules and #server_info channels thoroughly for our code of conduct**.

Swing by **#lounge** to hang out and get to know other members! If you'd like help using GameMaker, please use one of the **#help** channels. If someone is currently being helped, please don't interrupt!

If you are new to GameMaker, and are unsure where to start, you can check out this page in our [FAQ channel](https://discord.com/channels/262834612932182025/1351147798971809922) to help you get started!`;

export async function onGuildMemberAdd(member: GuildMember) {
  if (member.guild.id !== config.discordIds.guildId) return;

  const embed = new EmbedBuilder()
  .setColor(config.defaultEmbedColor)
  .setDescription(welcomeMessage)
  .setTimestamp(new Date())
  .setFooter({
    text: 'This is an automated message'
  });

  member.send({ embeds: [embed] });

  const securityChannel = await getTextChannel(config.discordIds.channels.securityChannel);
  if (!securityChannel) return;

  securityChannel.send({
    content: `${member.displayName}, tag: ${member} has joined.`
  });
}
