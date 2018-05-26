import http = require('http');
import { Message, RichEmbed } from 'discord.js';
import { prefixedCommandRuleTemplate } from '../../config';
import { Command, CommandClass } from '../../shared';

import { minibossKeywords } from './miniboss.keywords';

@Command({
  matches: ['miniboss', 'mb', 'pedro', 'saint11'],
  ...prefixedCommandRuleTemplate
})
export class MinibossCommand implements CommandClass {
  link = 'Here\'s a list of useful pixelart references:\n' +
         '<http://blog.studiominiboss.com/pixelart>\n';

  help = '\nYou can use ``!miniboss <image number>`` or ``!miniboss <image name>`` ' +
         '(without the <>) to get a specific post with image from the site.\n' +
         'If the post has more than one image attached, you can use ``!miniboss <post> ' +
         '<index>`` to link a specific image (where <post> is one of the commands above)';

  /**
   * Command action
   * @param msg 
   * @param args
   */
  action(msg: Message, args: string[]) {
    // User doesn't know what they are doing, send 'em the deets
    if (args.length <= 1) {
      msg.channel.send(this.help + this.link);
      return;
    }

    // Provide help info if requested
    switch (args[1].toUpperCase()) {
      case 'HELP':
        msg.channel.send(this.help);
        return;
      case 'WEB':
      case 'LINK':
      case 'PAGE':
      case 'SITE':
        msg.channel.send(this.link);
        return;
    }
  }
}
