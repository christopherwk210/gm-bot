import { Message, Client, GuildMember, TextChannel } from 'discord.js';
import { serverIDs } from '../../config';
import { channelService } from '../../shared';

/**
 * Parses a modifier list against a discord message
 * @param msg Disord message to check for soem basic spambots
 * @returns Nothing, honestly
 */

export function detectSpamMessage(msg: Message) {
  if (msg.content.match(/naked|nude|photos/)) {
    if (msg.content.match(/https?:\/\/\S+/i)) {
      let channel = getSecurityChannel();
      channel.send( `Suspicious message detected! \nPosted by <@${msg.author.id}>\n` +
                    `Message: \`\`${msg.cleanContent}\`\`\nMessage Link: ${msg.url}`);
    }
  }
}

function getSecurityChannel(): TextChannel {
  return <any>channelService.getChannelByID(serverIDs.channels.dingusSecurityChannelID);
}
