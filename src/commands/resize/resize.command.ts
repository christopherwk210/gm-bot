import { Message, Attachment } from 'discord.js';
import { prefixedCommandRuleTemplate } from '../../config';
import { Command, CommandClass } from '../../shared';
import { read, RESIZE_BILINEAR, RESIZE_NEAREST_NEIGHBOR, MIME_PNG } from 'jimp';
import * as execBuffer from 'exec-buffer';
import * as gifsicle from 'gifsicle';
import * as  request from 'request';

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
    let useBilinear = !!(~args.indexOf('-b'));
    let uploadOriginal = !!(~args.indexOf('-o'));

    // Get all message attachments
    let attachments = Array.from(msg.attachments.values());

    // Ensure an attachment exists
    if (!attachments.length) {
      msg.channel.send('Invalid command usage! You must upload an image with your message when using the resize command.');
      return;
    }

    // Loop through each image
    attachments.forEach((image: any) => {
      if (image.filename.toLowerCase().endsWith('.gif')) {
        // Download and process animated gif
        request({url: image.url, encoding: null}, (err, response, buffer) => {

          if (err !== null || response.statusCode !== 200 || buffer === undefined) {
            this.errorHandler(msg, image);
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
            this.outputHandler(msg, null, outBuffer, image, scaleFactor, uploadOriginal);
          });

        });
      } else {
        // Download and process static images
        read(image.url, (err, jimpImage) => {

          if (err !== null || jimpImage === undefined) {
            this.errorHandler(msg, image);
            return;
          }

          // Determine scaling mode
          let mode = useBilinear ? RESIZE_BILINEAR : RESIZE_NEAREST_NEIGHBOR;

          // Scale and readout to buffer
          jimpImage.scale(scaleFactor, mode).getBuffer(MIME_PNG, (jimpErr, buffer) => {
            this.outputHandler(msg, jimpErr, buffer, image, scaleFactor, uploadOriginal);
          });

        });
      }
    });
  }

  /**
   * Error handler function
   * @param msg
   * @param image
   */
  errorHandler(msg: Message, image: any) {
    msg.channel.send(`There was an error reading ${image.filename}!`);
  }

  /**
   * Output handler function
   * @param msg
   * @param err
   * @param buffer
   * @param image
   * @param scaleFactor
   * @param uploadOriginal
   */
  outputHandler(msg: Message, err: any, buffer: any, image: any, scaleFactor: number, uploadOriginal: boolean) {
    if (err) {
      msg.channel.send(`There was an error scaling ${image.filename}!`);
      return;
    }

    // Create a discord attachment
    let newImage = new Attachment(buffer, image.filename);

    // Send the image to the channel
    msg.channel.send(`Here's your image, ${msg.author}. Scaled by ${scaleFactor}x.`, newImage).then(() => {
      if (uploadOriginal) {
        msg.channel.send(`Here's the original image: ${image.url}`);
      }
    });
  }
}
