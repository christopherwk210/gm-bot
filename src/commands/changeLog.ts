import { Message } from 'discord.js';

// Node libs
import puppeteer = require('puppeteer');

/**
 * Sends a screenshot of the most recent changes to discord
 * @param msg Discord message
 */
module.exports = (msg: Message) => {
  sendReleaseScreenshot(msg);
}

/**
 * Takes a screenshot of the release notes and sends it to the chat
 * @param msg Discord message
 */
function sendReleaseScreenshot(msg: Message) {
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
    
    // Send the message
    msg.channel.send('Release Notes:', {
      file: image,
      name: 'capture.png'
    }).then(() => { message.delete(); }).catch(() => {});
  });
}
