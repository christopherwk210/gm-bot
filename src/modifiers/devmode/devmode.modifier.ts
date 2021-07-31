// This file contains unused imports purposefully, so that they are available for eval usage

import * as Discord from 'discord.js';
import { Message, Client, Snowflake } from 'discord.js';
import { Modifier, ModifierClass } from '../../shared';
import * as shared from '../../shared';

const MessageEmbed = Discord.MessageEmbed;
const MessageAttachment = Discord.MessageAttachment;

@Modifier({
  match: '!devmode'
})
export class DevmodeModifier implements ModifierClass {
  // Keep a local reference to the shared libraries for dev access
  shared = shared;

  // Represents whitelisted users
  whitelist: Snowflake[];

  constructor() {
    this.whitelist = this.getAccessIDs();
  }

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
    return this.whitelist.includes(msg.author.id);
  }

  getAccessIDs() {
    let access = this.shared.textService.files['devmode-access'];

    // Remove everything that isn't a digit or newline from the access file
    access = access.replace(/[^0-9\n]/g, '');

    return access.split('\n');
  }
}
