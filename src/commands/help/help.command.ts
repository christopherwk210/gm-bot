import * as fs from 'fs';
import * as path from 'path';

import { Message, RichEmbed } from 'discord.js';
import { prefixedCommandRuleTemplate, defaultEmbedColor } from '../../config';
import { Command, CommandClass, detectStaff, markdownService } from '../../shared';

@Command({
  matches: ['help'],
  ...prefixedCommandRuleTemplate
})
export class HelpCommand implements CommandClass {
  helpFiles: any = {};

  constructor() {
    this.helpFiles.admins = markdownService.files['help.admins'];
    this.helpFiles.ducks = markdownService.files['help.ducks'];
    this.helpFiles.ducksContinued = markdownService.files['help.ducks.cont'];
    this.helpFiles.all = markdownService.files['help.all'];
  }

  /**
   * Will send proper help messages
   * @param msg 
   * @param args 
   */
  action(msg: Message, args: string[]) {
    if (args[1]) {
      this.getDocsPage(args[1]).then(result => {
        let embed = new RichEmbed({
          description: result,
          color: defaultEmbedColor,
          timestamp: new Date()
        });

        msg.author.send(embed);
      });
      return;
    }

    let command;

    // Determine the correct help message to deliver
    if ((msg.member)) {
      command = detectStaff(msg.member);
    }

    // Deliver the proper message
    switch (command) {
      case 'admin':
        msg.author.send(this.helpFiles.admins);
      case 'art':
      case 'code':
      case 'audio':
        msg.author.send(this.helpFiles.ducks);
        msg.author.send(this.helpFiles.ducksContinued);
      default:
        msg.author.send(this.helpFiles.all);
    }
  }

  /**
   * Returns a documentation page
   * @param page 
   */
  getDocsPage(page: string): Promise<string> {
    const commandDocsLocation = path.join(__dirname, '../../../docs/features/commands');

    return new Promise(resolve => {
      fs.readdir(commandDocsLocation, (err, files) => {
        if (err) return resolve('Could not find the specified documentation.');
        files.some(file => {
          let fileName = path.basename(file, '.md');

          if (fileName === page) {
            let filePath = path.join(commandDocsLocation, file);
            fs.readFile(filePath, 'utf8', (readErr, data) => {
              if (readErr) return resolve('Could not read the specified documentation.');
              resolve(data);
            });
            return true;
          }
        });
      });
    });
  }
}
