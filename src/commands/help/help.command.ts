import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';

const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);

import { Message, RichEmbed } from 'discord.js';
import { prefixedCommandRuleTemplate, defaultEmbedColor } from '../../config';
import { Command, CommandClass, detectStaff, markdownService } from '../../shared';

@Command({
  matches: ['help'],
  ...prefixedCommandRuleTemplate
})
export class HelpCommand implements CommandClass {
  helpFiles: any = {};

  // Documentation locations
  commandDocsLocation = path.join(__dirname, '../../../docs/features/commands');
  modifierDocsLocation = path.join(__dirname, '../../../docs/features/modifiers');

  helpMessage =
    'Hi, I\'m GameMakerBot. To get help with a specific command, use `!help topic`. Here are all of the topics you can get help with:\n\n';

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
  async action(msg: Message, args: string[]) {
    if (args[1]) {
      let docsPage = await this.getDocsPage(args[1]);
      let titleRegExp = /#\s[\S ]+(\n|\r)/g;
      let embed = new RichEmbed({
        color: defaultEmbedColor,
        timestamp: new Date()
      });

      let match = docsPage.match(titleRegExp);

      if (match) {
        let title = match[0];

        docsPage = docsPage.replace(title, '');
        title = title.replace('#', '').replace(/(\n|\r)/g, '');

        embed.title = title;
        embed.description = docsPage;
      } else {
        embed.description = docsPage;
      }

      msg.author.send(embed);
      return;
    }

    let commands = await this.getCommandNames();
    let modifiers = await this.getModifierNames();

    let message = `${this.helpMessage}**Commands:**\n` +
                  `\`\`\`${commands.join(', ')}\`\`\`\n**Modifiers**\n` +
                  `\`\`\`${modifiers.join(', ')}\`\`\`\n`;

    message += 'Commands are special functions that provide helpful features.\n' +
               'Modifiers are special code block languages that the bot recognizes.';

    msg.author.send(message);
  }

  /**
   * Sends the old markdown help message
   * @param msg 
   */
  deliverOldHelpMessage(msg: Message) {
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

  /** Returns all command documentation file (topic) names */
  async getCommandNames() {
    let files: string[];
    let fileNames: string[] = [];

    try {
      files = await readdir(this.commandDocsLocation);
    } catch (e) {
      return ['Missing documentation files... Please contact the admins.'];
    }

    files.forEach(file => {
      let fileName = path.basename(file, '.md');
      fileNames.push(fileName);
    });

    return fileNames;
  }

  /** Returns all modifier documentation file (topic) names */
  async getModifierNames() {
    let files: string[];
    let fileNames: string[] = [];

    try {
      files = await readdir(this.modifierDocsLocation);
    } catch (e) {
      return ['Missing documentation files... Please contact the admins.'];
    }

    files.forEach(file => {
      let fileName = path.basename(file, '.md');
      fileNames.push(fileName);
    });

    return fileNames;
  }

  /**
   * Returns a documentation page
   * @param page 
   */
  async getDocsPage(page: string): Promise<string> {
    // Load commands
    let files: string[];
    try {
      files = await readdir(this.commandDocsLocation);
    } catch (e) {
      return 'Missing documentation files... Please contact the admins.';
    }

    for (let file of files) {
      let fileName = path.basename(file, '.md');

      if (fileName === page) {
        let filePath = path.join(this.commandDocsLocation, file);
        let fileContents: string;

        try {
          fileContents = await readFile(filePath, 'utf8');
        } catch (e) {
          return 'Error reading the specified documentation... Please contact the admins.';
        }

        return fileContents;
      }
    }

    // Load modifiers
    try {
      files = await readdir(this.modifierDocsLocation);
    } catch (e) {
      return 'Missing documentation files... Please contact the admins.';
    }

    for (let file of files) {
      let fileName = path.basename(file, '.md');

      if (fileName === page) {
        let filePath = path.join(this.modifierDocsLocation, file);
        let fileContents: string;

        try {
          fileContents = await readFile(filePath, 'utf8');
        } catch (e) {
          return 'Error reading the specified documentation... Please contact the admins.';
        }

        return fileContents;
      }
    }

    return 'Could not find the specified documentation.';
  }
}
