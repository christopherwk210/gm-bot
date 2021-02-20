import { Message, RichEmbed } from 'discord.js';
import { prefixedCommandRuleTemplate } from '../../config';
import { Command, CommandClass } from '../../shared';
import * as request from 'request';
import * as path from 'path';

@Command({
  matches: ['scan'],
  ...prefixedCommandRuleTemplate,
  delete: false
})
export class ScanCommand implements CommandClass {

  /**
   * Command action
   * @param msg Original discord message
   * @param args Message contents, split on space character
   */
  async action(msg: Message, args: string[]) {
    const attachments = msg.attachments.array();

    if (!attachments.length || path.extname(attachments[0].filename) !== '.yyp') {
      return msg.channel.send('Invalid command usage! You must upload a YYP project with your message when using the scan command.');
    }

    try {
      const scan = await this.scanYYP(attachments[0].url);

      if (scan) {
        const embed = new RichEmbed({
          title: path.basename(attachments[0].url),
          description: 'Scan success!'
        });

        for (const key of Object.keys(scan)) embed.addField(key, scan[key]);
        await msg.channel.send(embed);
      } else {
        await msg.channel.send('There was a problem scanning your YYP. Dang.');
      }

      msg.delete();
    } catch (e) {}
  }

  scanYYP(url: string) {
    return new Promise(resolve => {
      request(url, (err, res, body) => {
        const scan = {};
        let success = true;

        try {
          // Safe parse YYP
          let yyp = null;

          // tslint:disable-next-line:no-eval
          eval(`yyp = JSON.parse(JSON.stringify(${body}))`);

          // Ensure valid yyp resources
          if (yyp && yyp.resources && yyp.resources.length && yyp.resources.length > 0) {

            // Iterate resources
            for (const resource of yyp.resources) {

              // Check for valid resource path
              if (resource.id && resource.id.path) {
                const resourcePathRoot = resource.id.path.split('/')[0];
                scan[resourcePathRoot] = scan[resourcePathRoot] ? scan[resourcePathRoot] + 1 : 1;
              }
            }
          }
        } catch (e) {
          success = false;
        }

        resolve(success ? scan : null);
      });
    });
  }
}
