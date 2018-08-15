import { Message } from 'discord.js';
import { prefixedCommandRuleTemplate } from '../../config';
import { Command, CommandClass, detectStaff, jsonService, AsyncWriter } from '../../shared';

import * as path from 'path';
import * as fs from 'fs';
import * as util from 'util';

let writeFileAsync = util.promisify(fs.writeFile);
let existsAsync = util.promisify(fs.exists);
let imgur = require('../../../modules/imgur');

@Command({
  matches: ['pixelchallenge', 'logo'],
  ...prefixedCommandRuleTemplate,
  delete: false
})
export class PixelChallengeCommand implements CommandClass {
  /** Holds current pixel challenge entries */
  currentPixelChallenge = {
    entries: []
  };

  /** Challenges data file location */
  challengesDataPath = path.join(__dirname, '../../../data/pixelChallenges.json');

  /** Async pixel challenges writer function */
  asyncWriter: AsyncWriter;

  constructor() {
    this.asyncWriter = jsonService.getAsyncWriter(this.challengesDataPath, true);
  }

  /**
   * Loads existing entries if they exist
   */
  async loadEntries() {
    let existingChallenges = await existsAsync(this.challengesDataPath);

    if (existingChallenges) {
      this.currentPixelChallenge = require(this.challengesDataPath);
    } else {
      await writeFileAsync(this.challengesDataPath, { entries: [] });
      this.currentPixelChallenge = { entries: [] };
    }
  }

  /**
   * Creates an imgur album of all the current entries
   * @param msg 
   */
  async createImgurAlbum(msg: Message) {
    let album;
    let msgRef;
    let errors = [];

    try {
      msgRef = await msg.author.send('Creating album, please wait...');
    } catch (e) {
      console.log(e);
      return;
    }

    try {
      album = await imgur.createAlbum();
    } catch (e) {
      console.log('imgur error:', e);
      msgRef.edit('Something went wrong when contacting the imgur api... :(');
      return;
    }

    for (let entry of this.currentPixelChallenge.entries) {
      try {
        await imgur.uploadUrl(entry.link, album.data.deletehash, entry.name, entry.text.replace('!pixelchallenge', ''));
      } catch (e) {
        errors.push(entry);
      }
    }

    msgRef.edit(`Uploads complete. View album here: https://imgur.com/a/${album.data.id}.`);

    if (errors.length > 0) {
      try {
        await msg.author.send('There were errors uploading some images. The following images did not upload correctly:');

        errors.forEach(entry => {
          msg.author.send(`user: ${entry.name}, link: <${entry.link}>`);
        });
      } catch (e) {
        // nil
      }
    }
  }

  /**
   * Handles pixel challenge entries
   * @param msg 
   * @param args
   */
  async action(msg: Message, args: string[]) {
    if (!msg.member) {
      msg.channel.send('You can only do that in the /r/GameMaker Discord Server, you silly!');
      return;
    }

    // Reload what's on disk
    await this.loadEntries();

    if (detectStaff(msg.member)) {

      // List all entries
      if (args.length > 1 && args[1] === '-list') {

        msg.author.send('Here are the current entries:').then(() => {
          if (this.currentPixelChallenge.entries.length > 0) {
            this.currentPixelChallenge.entries.forEach(entry => {
              msg.author.send(`**User:** ${entry.name}, **Message:** ${(entry.text || '(no text provided)')}, **Entry:** ${entry.link}`);
            });
          } else {
            msg.author.send('loljk there are no entries yet, sorry dude');
          }
        });
        msg.delete();
        return;

      } else if (args.length > 1 && args[1] === '-clear') {

        // Clear all entries
        msg.author.send('The entries have been cleared! Here are entries you cleared, one last time:').then(() => {
          if (this.currentPixelChallenge.entries.length > 0) {
            this.currentPixelChallenge.entries.forEach(entry => {
              msg.author.send(`**User:** ${entry.name}, **Entry:** ${entry.link}`);
            });
            this.currentPixelChallenge.entries = [];
          } else {
            msg.author.send('Actually, there were no entries to clear. You cleared nothing. It was a waste of time.');
          }
        });

        this.asyncWriter(this.currentPixelChallenge);

        msg.delete();
        return;
      } else if (args.length > 1 && args[1] === '-imgur') {
        if (this.currentPixelChallenge.entries.length > 0) {
          this.createImgurAlbum(msg);
        } else {
          msg.author.send('No entries yet! Skipping imgur upload.');
        }
        return;
      }
    }

    // Get all message attachments
    let attachments: any[] = Array.from(msg.attachments.values());

    // Ensure an attachment exists
    if (!attachments.length) {
      msg.channel.send('Invalid command usage! You must upload an image with your message when using the pixel challenge command.');
      return;
    }

    let found = false;

    // Check if this user already has an entry
    this.currentPixelChallenge.entries.forEach(entry => {
      if (entry.name === msg.author.username) {
        found = true;

        // Take first image
        entry.link = attachments[0].url;

        // Update text
        entry.text = msg.content;

        msg.channel.send(`Updated existing entry for ${msg.author}.`);

        this.asyncWriter(this.currentPixelChallenge);
      }
    });

    // Write if not found
    if (!found) {
      this.currentPixelChallenge.entries.push({
        name: msg.author.username,
        text: msg.content,
        link: attachments[0].url
      });

      msg.channel.send(`Contest entry for ${msg.author} recorded.`);

      this.asyncWriter(this.currentPixelChallenge);
    }
  }
}
