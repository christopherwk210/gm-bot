import { Message, Client, RichEmbed, Attachment, Snowflake } from 'discord.js';
import {
  Modifier,
  ModifierClass,
  roleService,
  guildService,
  channelService,
  giveawayService,
  jsonService,
  markdownService,
  textService
} from '../../shared';

@Modifier({
  match: 'devmode'
})
export class DevmodeModifier implements ModifierClass {
  /** Represents whitelisted users */
  whitelist: Snowflake[] = [
    '144913457429348352', // topherlicious
    '227032791013916672'  // TonyStr
  ];

  /**
   * Executes code with eval, for development purposes only
   * @param msg 
   * @param contents 
   */
  action(msg: Message, contents: string[]) {
    // Create helper functions
    let reply = function(str) {
      msg.channel.send(str);
    };

    // Execute code
    eval(contents[0]);
  }

  /** Only allow whitelisted folks through */
  pre(msg: Message) {
    return !!(~this.whitelist.indexOf(msg.member.id));
  }
}
