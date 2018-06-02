import * as Discord from 'discord.js';
import { Message, Client, Snowflake } from 'discord.js';
import { Modifier, ModifierClass } from '../../shared';
import * as shared from '../../shared';

const RichEmbed = Discord.RichEmbed;
const Attachment = Discord.Attachment;

@Modifier({
  match: '!devmode'
})
export class DevmodeModifier implements ModifierClass {
  /** Keep a reference to the shared libraries for dev access */
  shared = shared;

  /** Represents whitelisted users */
  whitelist: Snowflake[] = [
    '144913457429348352', // topherlicious
    '227032791013916672' // TonyStr
  ];

  /**
   * Executes code with eval, for development purposes only
   * @param msg
   * @param contents
   */
  action(msg: Message, contents: string[]) {
    // Create helper function
    // tslint:disable-next-line
    let reply = function(str) {
      msg.channel.send(str);
    };

    // Execute code
    try {
      // tslint:disable-next-line:no-eval
      eval(contents[0]);
    } catch (err) {
      msg.channel.send('```Error:\n' + err + '\n```');
    }
  }

  /** Only allow whitelisted folks through */
  pre(msg: Message) {
    return !!(~this.whitelist.indexOf(msg.author.id));
  }
}
