
import * as path from 'path';

import { Message, Attachment } from 'discord.js';
import { Command, CommandClass, helpcardService } from '../../shared';
import { prefixedCommandRuleTemplate } from '../../config';

@Command({
  matches: ['helpcard'],
  ...prefixedCommandRuleTemplate
})

export class HelpcardCommand implements CommandClass {

    action(msg: Message, args: string[]) {

        if (args.length <= 1) msg.channel.send('Invalid command usage! You must specify a helpcard name: ``!helpcard "example_name_here"`` (without the quotes).');

        if (helpcardService.imageNames.includes(args[1].replace(/\s+/g, '_'))) {
            msg.channel.send(new Attachment(`${helpcardService.imagePath}/${args[1]}.png`));
        } else {
            msg.channel.send('Could not find specified helpcard.');
        }
    }
}
