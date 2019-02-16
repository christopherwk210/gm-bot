import { Message } from 'discord.js';
import { Modifier, ModifierClass } from '../../shared';
import * as https from 'https';

@Modifier({
  match: 'haste',
  delete: true
})
export class HasteModifier implements ModifierClass {

  async action(msg: Message, contents: string[]) {
    let replies: string[] = [];

    // Get hastebin links for each code block
    for (let codeBlock of contents) {
      let link: string;

      try {
        link = await this.getHasteBinLink(codeBlock);
      } catch (e) {
        console.error(e);
        msg.channel.send('An error occurred while connecting to firebin!');
        return;
      }

      replies.push(`Here's your firebin link, ${msg.author}\n${link}`);
    }

    // Send each link
    replies.forEach(reply => msg.channel.send(reply));
  }

  /**
   * Creates a GML hastebin post and returns the link
   * @param contents Contents of the post
   * @returns A promise containing the link
   */
  getHasteBinLink(contents: string): Promise<string> {
    // Prepare to contact
    let postOptions = {
      host: 'us-central1-gmtools-meseta.cloudfunctions.net',
      path: '/saveFirebinExt',
      port: '443',
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain'
      }
    };

    return new Promise((resolve, reject) => {
      // Configure request
      let postRequest = https.request(postOptions, res => {
        // Encode to UTF8
        res.setEncoding('utf8');

        // Create a callback to retrieve url
        res.on('data', (response: string) => {
          // Parse the response for the key
          let out;
          try {
            out = JSON.parse(response);
          } catch (e) {
            return reject(e);
          }
          let link = `https://firebin.gmcloud.org/${out.binId}.gml`;
          resolve(link);
        });

        res.on('error', err => reject(err));
      });

      // Sending Requestt
      postRequest.write(contents);
      postRequest.end();
    });
  }
}
