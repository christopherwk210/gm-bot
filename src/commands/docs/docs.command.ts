import * as vm from 'vm';
import * as http from 'http';
import * as puppeteer from 'puppeteer';
import concat = require('concat-stream');

import { Message, RichEmbed, User } from 'discord.js';

import { prefixedCommandRuleTemplate } from '../../config';
import {
  Command,
  CommandClass,
  detectStaff,
  markdownService,
  jsonService,
  validateGMS1,
  validateGMS2,
  docService
} from '../../shared';

// Prevent errors when running things in puppeteer context
declare let SearchTitles;
declare let SearchFiles;

@Command({
  matches: ['docs', 'doc'],
  ...prefixedCommandRuleTemplate
})
addexport class DocsCommand implements CommandClass {
  /**
   * Commence documentation fetching!
   * @param msg
   * @param args
   */
  action(msg: Message, args: string[]) {
    // Default to GMS2 documentation
    let version = 'GMS2';
    let image = false;
    let whoTag;

    if (args.length === 1) {
      // Throw on unsupplied function
      msg.author.send(
        'You did not include something to find. Type `!help` for help with commands.'
      );
      return;
    } else if (args.length > 2) {
      if (args.indexOf('-i') !== -1) image = true;

      // find a mention tag
      if (msg.mentions.users.first() !== undefined && detectStaff(msg.member)) {
        whoTag = msg.mentions.users.first();

        // check if tagged user is a member of of the server
        if (
          msg.mentions.members.first() === undefined ||
          msg.mentions.users.first().id !== msg.mentions.members.first().id
        ) {
          msg.author.send(`<@${whoTag.id}> was not a recognized user.`);
          return;
        }
      }
    }

    // tag self if no tag provided
    if (whoTag === undefined) {
      whoTag = msg.author;
    }

    if (args.some(v => v.toLowerCase().includes('gms1'))) {
      msg.author.send(
        'We no longer support Gms1 Documentation, as Gms1.4999 was sunset on June 8 2017'
      );
    }

    // Attempt our new Docs method
    const possibleFancyEmbed = this.attemptNewDocs(args[1], whoTag);
    if (possibleFancyEmbed) {
      msg.channel.send(possibleFancyEmbed);
      return;
    }

    msg.author.send(
      `\`${args[1]}\` was not a recognized GMS2 function. Type \`!help\` for help with commands.`
    );
  }

  attemptNewDocs(docWord: string, user: User): undefined | RichEmbed {
    // New Docs style ability -- query the shared service
    const docInfo = docService.docsFindEntry(docWord);
    if (!docInfo) {
      const errColor = 16032066;

      // We failed! Oh no! Try to get closest entries
      const closestDocs = docService.docsFindClosest(docWord, 5);

      // Create a list of links to closest entries
      let linkList = '';
      for (let closestDoc of closestDocs) {
        linkList += `[${closestDoc.name}](${closestDoc.link})\n`;
      }

      const ourEmbed = new RichEmbed({
        color: errColor,
        title: 'No function found',
        description: `No function or variable was found by the name of \`${docWord}\`, did you mean one of the following?\n${linkList}`,
        timestamp: new Date(),
        footer: {
          text: `This message was called for ${user.username}`
        }
      });
      return ourEmbed;
    }

    // For Functions
    if (docInfo.type === 'function') {
      // Wow! Much Function!
      const funcColor = 3447003;

      // Limit our Description to just the first sentence
      const funcDesc = docInfo.entry.documentation.slice(
        0,
        docInfo.entry.documentation.indexOf('.') + 1
      );

      // Create our Arguments and sort the strong from the, uh, optional arguments
      const ourArgs: string[] = [];
      for (let i = 0; i < docInfo.entry.parameters.length; i++) {
        const thisParam = docInfo.entry.parameters[i];
        let thisParamEntry = '';

        // Are we optional?
        if (i >= docInfo.entry.minParameters) {
          thisParamEntry += '**[' + thisParam.label + ']**: ';
        } else {
          thisParamEntry += '**' + thisParam.label + '**: ';
        }

        // Add our Parameter Documentation (such as it is)
        thisParamEntry += thisParam.documentation;

        // Shove it into the Array
        ourArgs.push(thisParamEntry);
      }

      const ourEmbed = new RichEmbed({
        color: funcColor,
        title: docInfo.entry.signature,
        url: docInfo.entry.link,
        description: funcDesc,
        fields:
          ourArgs.length === 0
            ? undefined
            : [
                {
                  name: 'Arguments',
                  value: ourArgs.join('\n'),
                  inline: true
                }
              ],
        timestamp: new Date(),
        footer: {
          text: `This message was called for ${user.username}`
        }
      });

      return ourEmbed;
    }

    // For Variables
    if (docInfo.type === 'variable') {
      // Okay, we got ourselves a variable
      const varColor = 1572715;

      // Create a nice title with type:
      const varTitle =
        docInfo.entry.name + ': *' + docInfo.entry.type.toLowerCase() + '*';

      // Limit our Description to just the first sentence
      const varDesc = docInfo.entry.documentation.slice(
        0,
        docInfo.entry.documentation.indexOf('.') + 1
      );

      const ourEmbed = new RichEmbed({
        color: varColor,
        title: varTitle,
        url: docInfo.entry.link,
        description: varDesc,
        timestamp: new Date(),
        footer: {
          text: `This message was called for ${user.username}`
        }
      });

      return ourEmbed;
    }

    // We'll never make it here, but here's an undefined for safety
    return undefined;
  }
}
