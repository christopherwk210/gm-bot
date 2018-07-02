
import { Message, Attachment } from 'discord.js';
import { Command, CommandClass, helpcardService } from '../../shared';
import { prefixedCommandRuleTemplate } from '../../config';

@Command({
  matches: ['helpcard'],
  ...prefixedCommandRuleTemplate
})

export class HelpcardCommand implements CommandClass {
  action(msg: Message, args: string[]) {

    // Return early if no argument is provided
    if (args.length <= 1) {
      msg.channel.send('Invalid command usage! You must specify a helpcard name: ``!helpcard "example_name_here"`` (without the quotes).');
      return;
    }

    // Slice away the command and replace whitespace with underscores
    let cardName = msg.content.slice(args[0].length).trim();
    cardName = cardName.replace(/\s+/g, '_');

    console.log(cardName);

    // Upload and send helpcard image if a valid match is found
    if (helpcardService.imageNames.includes(cardName)) {
      msg.channel.send(new Attachment(`${helpcardService.imagePath}/${cardName}.png`));

    } else {
      msg.channel.send('Could not find specified helpcard.');
    }
  }
}
