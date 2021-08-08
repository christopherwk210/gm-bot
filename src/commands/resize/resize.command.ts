import { Message, MessageAttachment } from 'discord.js';
import { prefixedCommandRuleTemplate } from '../../config';
import { Command, CommandClass } from '../../shared';

import jimp = require('jimp');
import * as execBuffer from 'exec-buffer';
import * as gifsicle from 'gifsicle';
import * as request from 'request';

@Command({
  matches: ['resize', 'upscale', 'upsize'],
  ...prefixedCommandRuleTemplate
})
export class ResizeCommand implements CommandClass {
  /**
   * Resizes an attached image of a discord message
   * @param msg
   * @param args
   */
  action(msg: Message, args: string[]) {
    // Ensure an argument was passed
    if (args.length < 2) {
      msg.channel.send('Invalid command usage! Proper usage: `!resize [scale_factor]`');
      return;
    }

    // Get the size factor
    let scaleFactor: any = args[1];
    scaleFactor = parseFloat(scaleFactor);

    // Make sure they didn't enter something stupid
    if (!scaleFactor || scaleFactor <= 0 || scaleFactor > 10) {
      msg.channel.send('Invalid scale factor! Please use a number >0 and <=10.');
      return;
    }

    // Check for bilinear scaling
    let useBilinear = args.includes('-b');
    let uploadOriginal = args.includes('-o');

    // Get all message attachments
    let attachments = Array.from(msg.attachments.values());

    // Ensure an attachment exists
    if (!attachments.length) {
      msg.channel.send('Invalid command usage! You must upload an image with your message when using the resize command.');
      return;
    }

    // Loop through each image
    attachments.forEach(attachment => {

      const filename = attachment.name;
      const url = attachment.url;

      // output closure
      function outputHandler(err, buffer) {
        if (err) {
          msg.channel.send(`There was an error scaling ${filename}!`);
          return;
        }

        // Create a discord attachment
        let newImage = new MessageAttachment(buffer, filename);

        // Send the image to the channel
        msg.channel.send(`Image scaled by ${scaleFactor}x, ${msg.author}`, newImage).then(() => {
          if (uploadOriginal) {
           msg.channel.send(`Here's the original image: ${url}`);
          }
        });
      }

      // error closure
      function errorHandler() {
        msg.channel.send(`There was an error reading ${filename}!`);
      }

      // process image depending on filetype
      if (filename.toLowerCase().endsWith('.gif')) {
        this.processGif(url, scaleFactor, useBilinear, errorHandler, outputHandler);
      } else {
        this.processImage(url, scaleFactor, useBilinear, errorHandler, outputHandler);
      }
    });
  }

  /**
   * Resizes a gif
   * @param url
   * @param scaleFactor
   * @param useBilinear
   * @param errorHandler
   * @param outputHandler
   */
  processGif(url, scaleFactor, useBilinear, errorHandler, outputHandler) {

    // Download and process animated gif
    request({url, encoding: null}, (err, response, buffer) => {

      if (err !== null || response.statusCode !== 200 || buffer === undefined) {
        errorHandler();
        return;
      }

      // Determine scaling mode
      let mode = useBilinear ? 'mix' : 'box';

      // Scale to and from buffer
      execBuffer({
        input: buffer,
        bin: gifsicle,
        args: [
          '--scale', String(scaleFactor),
          '--resize-method', mode,
          '-o', execBuffer.output,
          execBuffer.input
        ]
      }).then(outBuffer => {
        outputHandler(null, outBuffer);
      });

    });
  }

  /**
   * Resize image with jimp
   * @param url
   * @param scaleFactor
   * @param useBilinear
   * @param errorHandler
   * @param outputHandler
   */
  processImage(url, scaleFactor, useBilinear, errorHandler, outputHandler) {

    // Download and process static images
    jimp.read(url).then(jimpImage => {
        // Determine scaling mode
        let mode = useBilinear ? jimp.RESIZE_BILINEAR : jimp.RESIZE_NEAREST_NEIGHBOR;

        // Scale and readout to buffer
        jimpImage.scale(scaleFactor, mode).getBuffer(jimp.MIME_PNG, (jimpErr, buffer) => {
          outputHandler(jimpErr, buffer);
        });
    }).catch(err => {
      errorHandler();
      return;
    });
  }

}
