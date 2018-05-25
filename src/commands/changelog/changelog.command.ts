import { Message } from 'discord.js';
import { prefixedCommandRuleTemplate } from '../../config';
import { Command, CommandClass } from '../../shared';

import puppeteer = require('puppeteer');
import { MessageOptions } from 'child_process';

@Command({
  matches: ['changelog'],
  ...prefixedCommandRuleTemplate
})
export class ChangelogCommand implements CommandClass {
  action(msg: Message) {
    ChangelogCommand.sendReleaseScreenshot(msg);
  }

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

      // Modify the page to reduce screenshot size
      await page.evaluate(() => new Promise(res => {
        document.querySelector('h2').remove();
        document.querySelector('h5').remove();
        document.querySelector('label').remove();
        document.querySelector('label').remove();
        document.querySelector('.older-ver-div').remove();
        document.querySelector('#two').remove();
        document.querySelector('.description').remove();
        Array.from(document.querySelectorAll('p')).forEach(p => {
          if (p.innerText.length === 0) {
            p.remove();   
          }
        });
        Array.from(document.querySelectorAll('br')).forEach(br => {
          br.remove();
        });
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

      let messageOptions: any = {
        file: image,
        name: 'capture.png',
      };
      
      // Send the message
      msg.channel.send('Release Notes:', messageOptions)
        .then(() => message.delete());
    });
  }
}
