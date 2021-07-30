import { Message } from 'discord.js';
import { HasteModifier } from './modifiers';
import * as request from 'request-promise-native';

export async function handleAutoHasteMessage(msg: Message) {
  if (msg.attachments.size) {
    const attachments = msg.attachments.array();
    let fileContents = [];

    for (const file of attachments) {
      if (file.name.split('.').splice(-1)[0] === 'gml' && file.size < 5000) {
        try {
          const body = await request(file.url);
          fileContents.push(body);
        } catch (e) {
          console.log('Error automatically downloading GML file:\n\n');
          console.log(e);
        }
      }
    }

    if (fileContents.length) {
      const hasteModifier = new HasteModifier();
      hasteModifier.action(msg, fileContents);
    }
  }
}
