import * as https from 'node:https';
import { EmbedBuilder, Message } from 'discord.js';
import { parseCodeBlocks } from '../misc/discord-utils.js';
import { config } from '../data/config.js';

export async function handleHasteCodeBlockMessages(message: Message<boolean>) {
  const links: string[] = [];

  for (const { code } of parseCodeBlocks(message.content, 'haste')) {
    const link = await getHasteBinLink(code);
    links.push(link);
  }

  if (links.length === 0) return;

  await message.reply({
    embeds: [
      new EmbedBuilder()
      .setTitle(`Your code has been hasted!`)
      .setColor(config.defaultEmbedColor)
      .addFields(
        ...links.map((link, index) => ({
          name: `Code Block ${index + 1}`, value: link
        }))
      )
    ]
  });
}

/**
 * Creates a GML hastebin post and returns the link
 * @param contents Contents of the post
 * @returns A promise containing the link
 */
function getHasteBinLink(contents: string): Promise<string> {
  // Prepare to contact
  let postOptions = {
    host: 'us-central1-gmcloud-meseta.cloudfunctions.net',
    path: '/saveFirebinExt',
    port: '443',
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain'
    }
  };

  return new Promise(resolve => {
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
          return resolve('');
        }
        let link = `https://firebin.gmcloud.org/${out.binId}.gml`;
        resolve(link);
      });

      res.on('error', () => resolve(''));
    });

    // Sending Request
    postRequest.write(contents);
    postRequest.end();
  });
}
