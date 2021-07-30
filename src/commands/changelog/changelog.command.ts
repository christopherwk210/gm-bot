import { Message } from 'discord.js';
import { prefixedCommandRuleTemplate } from '../../config';
import { Command, CommandClass } from '../../shared';

import * as puppeteer from 'puppeteer';

@Command({
  matches: ['changelog'],
  ...prefixedCommandRuleTemplate
})
export class ChangelogCommand implements CommandClass {
  /**
   * Takes a screenshot of the release notes and sends it to the chat
   * @param msg Discord message
   */
  static sendReleaseScreenshot(msg: Message) {
    msg.channel.send('Loading release notes...').then(async (message: Message) => {
      // Launch chrome
      let browser = await puppeteer.launch();

      // Create a new page
      const page = await browser.newPage();

      // Navigate to the change log
      await page.goto('http://gms.yoyogames.com/ReleaseNotes.html');

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

      let messageOptions: any = {
        file: image,
        name: 'capture.png'
      };

      // Send the message
      msg.channel.send('Release Notes:', messageOptions)
        .then(() => message.delete());
    });
  }

  action(msg: Message) {
    ChangelogCommand.sendReleaseScreenshot(msg);
  }
}
