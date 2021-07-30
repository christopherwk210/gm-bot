import { Message, MessageAttachment } from 'discord.js';
import { Command, CommandClass, helpcardService } from '../../shared';
import { prefixedCommandRuleTemplate } from '../../config';

const discordMessageCharLimit = 2000;
const listMessage = 'The cards available with the ``!helpcard`` command are:```\n';
const listCharLimit = discordMessageCharLimit - 3; // trailing '```'

@Command({
  matches: ['helpcard', 'mash'],
  ...prefixedCommandRuleTemplate
})

export class HelpcardCommand implements CommandClass {
  action(msg: Message, args: string[]) {

    // Return early if no argument is provided
    if (args.length <= 1) {
      msg.channel.send('Invalid command usage! You must specify a helpcard name: ``!helpcard "example_name_here"``' +
        ' (without the quotes), or use ``!helpcard list`` to show available cards.');
      return;
    }

    // Reserve helpcard name 'list' for listing all available helpcards
    if (args.length === 2 && args[1] === 'list') {
      let out = listMessage;

      // Loop through all helpcard names
      for (let card of helpcardService.imageNames) {
        // Continue until all card names are in the out string, or the out string is too long
        if ((out + `• ${card}\n`).length >= listCharLimit) break;

        // Add card name to out string
        out += `• ${card}\n`;
      }
      // Send the list
      msg.channel.send(out + '```');
      return;
    }

    // Reserve helpcard name 'search' for finding specific helpcards
    if (args.length > 2 && args[1] === 'search') {
      // Create the default searchstring
      let searchString: string = args.slice(2).join('_').toLowerCase();

      // Keep track of search matches
      let attempts: string[] = [];

      // Attempt to match common differences
      if (helpcardService.imageNames.includes(searchString)) attempts.push(searchString);
      if (helpcardService.imageNames.includes(searchString.slice(-1))) attempts.push(searchString.slice(-1));
      if (helpcardService.imageNames.includes(searchString + 's')) attempts.push(searchString + 's');

      // Look for helpcard names incuding parts of the search string
      for (let arg of args.slice(2)) {
        for (let name of helpcardService.imageNames) {
          if (name.includes(arg.toLowerCase()) && !attempts.includes(name)) attempts.push(name);
        }
      }
      // If not matches were found, express sadness
      if (!attempts.length) {
        msg.channel.send('Could not find specified helpcard');
        return;
      }

      // Send the single matched card if only one was found
      if (attempts.length === 1) {
        msg.channel.send(`Only matching helpcard: \`\`${attempts[0]}\`\``,
          new MessageAttachment(`${helpcardService.imagePath}/${attempts[0]}.png`));
        return;
      }

      // Create a list over multiple matched card names, and send it
      let out = 'Search results for ' + searchString + ' are:```\n';
      for (let attempt of attempts) {
        out += `${attempt}\n`;
      }
      msg.channel.send(out + '```');
      return;
    }

    // Slice away the command and replace whitespace with underscores
    let cardName = args.slice(1).join('_').trim();

    // Upload and send helpcard image if a valid match is found
    if (helpcardService.imageNames.includes(cardName)) {
      msg.channel.send(new MessageAttachment(`${helpcardService.imagePath}/${cardName}.png`));

    } else {
      msg.channel.send('Could not find specified helpcard.');
    }
  }
}
