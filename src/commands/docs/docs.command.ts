import { Message, RichEmbed, User } from 'discord.js';

import { prefixedCommandRuleTemplate } from '../../config';
import {
  Command,
  CommandClass,
  detectStaff,
  docService,
  DocType,
  GmConstant,
  GmFunction,
  GmVariable
} from '../../shared';

@Command({
  matches: ['docs', 'doc'],
  ...prefixedCommandRuleTemplate
})
export class DocsCommand implements CommandClass {
  /**
   * Commence documentation fetching!
   * @param msg
   * @param args
   */
  action(msg: Message, args: string[]) {
    // Default to GMS2 documentation
    let whoTag;

    if (args.length === 1) {
      // Throw on unsupplied function
      msg.author.send(
        'You did not include something to find. Type `!help` for help with commands.'
      );
      return;
    } else if (args.length > 2) {
      // we don't autocomplete gms1 functions anymore
      if (args.some(v => v.toLowerCase().includes('gms1'))) {
        msg.author.send(
          'We no longer support Gms1 Documentation, as Gms1.4999 was sunset on June 8 2017'
        );
        return;
      }

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

    // Attempt our new Docs method
    const possibleFancyEmbed = this.attemptNewDocs(args[1], whoTag);
    if (possibleFancyEmbed) {
      msg.channel.send(possibleFancyEmbed);
    } else {
      msg.author.send(
        `\`${args[1]}\` was not a recognized GMS2 function. Type \`!help\` for help with commands.`
      );
    }
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
        title: 'No documentation entry found',
        description: `No documentation entry was found by the name of \`${docWord}\`; did you mean one of the following?\n${linkList}`,
        timestamp: new Date(),
        footer: {
          text: `This message was called for ${user.username}`
        }
      });
      return ourEmbed;
    }

    switch (docInfo.descriptor) {
      case DocType.Func: {
        // Wow! Much Function!
        const funcColor = 3447003;
        const func = docInfo.value as GmFunction;

        // Limit our Description to just the first sentence
        // THIS WON'T WORK LOOK AT IT AGAIN!!!
        const funcDesc = func.description.slice(
          0,
          func.description.indexOf('.') + 1
        );

        // Create our Arguments and sort the strong from the, uh, optional arguments
        const ourArgs: string[] = [];
        let signature = `${func.name}(`;
        for (let i = 0; i < func.parameters.length; i++) {
          const thisParam = func.parameters[i];
          let thisParamEntry = '';

          // Are we optional?
          if (
            i >= func.requiredParameters &&
            !(
              thisParam.parameter.startsWith('[') &&
              thisParam.parameter.endsWith(']')
            )
          ) {
            thisParamEntry += '**[' + thisParam.parameter + ']**: ';
          } else {
            thisParamEntry += '**' + thisParam.parameter + '**: ';
          }

          // Add our Parameter Documentation (such as it is)
          thisParamEntry += thisParam.description;

          // Shove it into the Array
          ourArgs.push(thisParamEntry);
          signature += `${thisParam.parameter}, `;
        }

        // slice off the last ', '
        signature = signature.slice(0, signature.length - 2);
        signature += ');';

        const ourEmbed = new RichEmbed({
          color: funcColor,
          title: signature,
          url: func.link,
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

      case DocType.Var: {
        // Okay, we got ourselves a variable
        const varColor = 1572715;
        const variable = docInfo.value as GmVariable;

        // Create a nice title with type:
        const varTitle =
          variable.name + ': *' + variable.returns.toLowerCase() + '*';

        // Limit our Description to just the first sentence
        const varDesc = variable.description.slice(
          0,
          variable.description.indexOf('.') + 1
        );

        const ourEmbed = new RichEmbed({
          color: varColor,
          title: varTitle,
          url: variable.link,
          description: varDesc,
          timestamp: new Date(),
          footer: {
            text: `This message was called for ${user.username}`
          }
        });
        return ourEmbed;
      }

      case DocType.Const: {
        // Okay, we got ourselves a variable
        const varColor = 16774448;
        const constant = docInfo.value as GmConstant;

        // Create a nice title with type:
        const varTitle = constant.name;

        // Limit our Description to just the first sentence
        let varDesc = constant.description.slice(
          0,
          constant.description.indexOf('.') + 1
        );

        if (constant.secondaryDescriptors !== undefined) {
          varDesc += '\n';
          for (const other in constant.secondaryDescriptors) {
            if (constant.secondaryDescriptors.hasOwnProperty(other)) {
              const desc = constant.secondaryDescriptors[other];
              varDesc += `${other}: ${desc}\n`;
            }
          }

          // slice off the last newline
          varDesc = varDesc.slice(0, -1);
        }

        const ourEmbed = new RichEmbed({
          color: varColor,
          title: varTitle,
          url: constant.link,
          description: varDesc,
          timestamp: new Date(),
          footer: {
            text: `This message was called for ${user.username}`
          }
        });
        return ourEmbed;
      }
    }
  }
}
