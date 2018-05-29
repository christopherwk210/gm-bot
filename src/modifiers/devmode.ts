import { Message, Client, RichEmbed, Attachment } from 'discord.js';
const devModeExp = new RegExp(/([`]{3})!devmode([^```]*)([`]{3})/g);

// Shared
import { roleService, guildService, channelService, giveawayService } from '../shared';

export function devmode(msg: Message, bot: Client) {
  if (!msg.member) return false;

  // Only topherlicious (and TonyStr) can use this feature!
  if (msg.member.id !== '144913457429348352' && msg.member.id !== '227032791013916672') {
    return false;
  }

  if (devModeExp.test(msg.content)) {
    // Fetch the code block contents
    let code = msg.content.match(devModeExp);

    // Get just the code
    let rawCode = code[0].substr(11,code[0].length - 14);

    // Create helper functions
    let reply = function(str) {
      msg.channel.send(str);
    };

    // Execute code
    eval(rawCode);

    return true;
  } else {
    return false;
  }
};
