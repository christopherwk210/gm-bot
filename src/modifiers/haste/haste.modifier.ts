import { Message } from 'discord.js';
import { Modifier, ModifierClass } from '../../shared';
import * as http from 'http';

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
      } catch(e) {
        console.error(e);
        msg.channel.send('An error occurred while connecting to hastebin!');
        return
      }

      replies.push(`Here's your GML hastebin link, ${msg.author}\n${link}`);
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
      host: 'haste.gmcloud.org',
      path: '/documents',
      port: '80',
      method: 'POST'
    };

    return new Promise((resolve, reject) => {
      // Configure request
      let postRequest = http.request(postOptions, res => {
        // Encode to UTF8
        res.setEncoding('utf8');

        // Create a callback to retrieve url
        res.on('data', (response: string) => {
          // Parse the response for the key
          let key = JSON.parse(response).key;
          let link = `http://haste.gmcloud.org/${key}.gml`;
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
