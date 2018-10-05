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
export class DocsCommand implements CommandClass {
  gms1DocumentationUrls: any;

  constructor() {
    this.gms1DocumentationUrls = jsonService.files['gms1-docs-urls'];
  }

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
      msg.author.send('You did not include a function name. Type `!help` for help with commands.');
      return;
    } else if (args.length > 2) {
      version = ~args.indexOf('gms1') || ~args.indexOf('GMS1') ? 'GMS1' : 'GMS2';
      if (args.indexOf('-i') !== -1) image = true;

      // find a mention tag
      if (msg.mentions.users.first() !== undefined  && detectStaff(msg.member)) {
        whoTag = msg.mentions.users.first();

        // check if tagged user is a member of of the server
        if (msg.mentions.members.first() === undefined || msg.mentions.users.first().id !== msg.mentions.members.first().id) {
          msg.author.send(`<@${whoTag.id}> was not a recognized user.`);
          return;
        }
      }
    }

    // tag self if no tag provided
    if (whoTag === undefined) {
      whoTag = msg.author;
    }

    // Switch on version
    switch (version) {
      case 'GMS1':
        // Determine if the provided function is a valid GMS1 function
        if (validateGMS1(args[1])) {
          // If so, provide the helps
          this.helpUrlGMS1(msg, args[1], image, whoTag.id);
        } else {
          // Otherwise, provide the nopes
          msg.author.send(`\`${args[1]}\` was not a recognized GMS1 function. Type \`!help\` for help with commands.`);
        }
        break;
      case 'GMS2':
        // Attempt our new Docs method
        const possibleFancyEmbed = this.attemptNewDocs(args[1], whoTag);
        if (possibleFancyEmbed) {
          msg.channel.send(possibleFancyEmbed);
          return;
        }

        // Determine if the provided function is a valid GMS2 function
        if (validateGMS2(args[1])) {
          // If so, give 'em the goods
          this.helpUrlGMS2(msg, args[1], image, whoTag.id);
        } else {
          // Otherwise, kick 'em to the curb
          msg.author.send(`\`${args[1]}\` was not a recognized GMS2 function. Type \`!help\` for help with commands.`);
        }
        break;
      default:
        // Invalid GMS version (this is actually impossible to reach, here just in case functionality changes)
        msg.author.send(`\`${version}\` was not a valid option. Type \`!help\` for help with commands.`);
        break;
    }

  }

  /**
   * Provide GMS1 doc URL
   * @param msg The Discord message asking for help
   * @param fn Function name to lookup
   * @param image whether to include a screenshot
   * @param who who to tag about the message
   */
  helpUrlGMS1(msg: Message, fn: string, image, who) {
    let found = false;

    // Loop through valid titles
    for (let i = 0; i < this.gms1DocumentationUrls.titles.length; i++) {
      // If we match up with a function
      if (this.gms1DocumentationUrls.titles[i] === fn) {
        // Send a screenshot if requested
        if (image) {
          this.sendScreenshot(
            `Here's the GMS1 documentation for \`${fn}\``,
            `http://docs.yoyogames.com/${this.gms1DocumentationUrls.files[i]}`,
            msg
          );
          return;
        }

        // Put together a URL and serve it on a silver platter
        msg.channel.send(`Here's the GMS1 documentation for \`${fn}\`, <@${who}>`);
        msg.channel.send(encodeURI(`http://docs.yoyogames.com/${this.gms1DocumentationUrls.files[i]}`));

        // We struck gold, ma!
        found = true;
        break;
      }
    }

    // No gold to be found
    if (!found) {
      // Tough luck
      msg.author.send(`\`${fn}\` was not a recognized GMS2 function. Type \`!help\` for help with commands.`);
    }
  }

  /**
   * Provide GMS2 doc URL
   * @param msg The Discord message asking for help
   * @param fn Function name to lookup
   * @param image whether to include a screenshot
   * @param who who to tag about the message
   */
  helpUrlGMS2(msg: Message, fn: string, image, who) {
    // Download super saucy secret file from YYG server
    http.get('http://docs2.yoyogames.com/files/searchdat.js', res => {
      // Read like a normal bot
      res.setEncoding('utf8');

      // Let's check the goods
      res.pipe(concat({ encoding: 'string' }, (remoteSrc: any) => {
        let found = false;

        if (remoteSrc.indexOf('<') === 0) {
          msg.author.send('GMS2 documentation is currently unavailable. Falling back to GMS1 documentation...');
          this.action(msg, ['!docs', fn, 'gms1']);
          return;
        }

        // Execute in context to access the inner JS
        vm.runInThisContext(remoteSrc, 'remote_modules/searchdat.js');

        // Loop through newly available SearchTitles (from searchdat.js)
        for (let i = 0; i < SearchTitles.length; i++) {
          // If we find the function we're looking for
          if (SearchTitles[i] === fn) {
            // Send a screenshot if requested
            if (image) {
              this.sendScreenshot(
                `Here's the GMS2 documentation for \`${fn}\``,
                `http://docs2.yoyogames.com/${SearchFiles[i]}`,
                msg
              );
              return;
            }

            // Provide it
            msg.channel.send(`Here's the GMS2 documentation for \`${fn}\`, <@${who}>`);
            msg.channel.send(encodeURI(`http://docs2.yoyogames.com/${SearchFiles[i]}`));

            // Indiciate we found it
            found = true;
            break;
          }
        }

        // If we haven't found jack...
        if (!found) {
          // Sorry pal
          msg.author.send(`\`${fn}\` was not a recognized GMS2 function. Type \`!help\` for help with commands.`);
        }
      }));
    });
  }

  /**
   * Takes a screenshot of a GMS docs page and sends it to the discord chat
   * @param messageText Message to send with screenshot
   * @param URL Website to take a screenshot of
   * @param msg
   */
  sendScreenshot(messageText: string, URL: string, msg: Message) {
    msg.channel.send('Loading documentation...').then(async (message: Message) => {
      // Launch chrome
      let browser = await puppeteer.launch();

      // Create a new page
      const page = await browser.newPage();

      // Navigate to the URL
      await page.goto(URL);

      // Remove the top useless elements of the docs page
      await page.evaluate(() => new Promise(res => {
        document.querySelector('table').remove();
        document.querySelector('br').remove();
        res();
      }));

      // Set our viewport to be 1280 wide
      await page.setViewport({
        width: 1280,
        height: 1
      });

      // Take a screenshot of the full page
      let image = await page.screenshot({
        fullPage: true
      });

      // Close the browser
      await browser.close();

      // Send the message
      msg.channel.send(messageText, <any>{
        file: image,
        name: 'capture.png'
      }).then(() => message.delete());
    });
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
            linkList += `* [${closestDoc.name}](${closestDoc.link})\n`;
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
        const funcDesc = docInfo.entry.documentation.slice(0, docInfo.entry.documentation.indexOf('.') + 1);

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
            fields: ourArgs.length === 0 ? undefined :
            [{
                name: 'Arguments',
                value: ourArgs.join('\n'),
                inline: true
            }],
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
        const varTitle = docInfo.entry.name + ': *' + docInfo.entry.type.toLowerCase() + '*';

        // Limit our Description to just the first sentence
        const varDesc = docInfo.entry.documentation.slice(0, docInfo.entry.documentation.indexOf('.') + 1);

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
