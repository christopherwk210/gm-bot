import { Message } from 'discord.js';
import { Modifier, ModifierClass } from '../../shared';

@Modifier({
  match: 'gmlive',
  delete: true
})
export class GmliveModifier implements ModifierClass {

  action(msg: Message, contents: string[]) {
    let urls: string[] = [];

    // Make links!
    contents.forEach(codeBlock => {
      urls.push(`http://yal.cc/r/gml/?mode=2d&gml=${Buffer.from(codeBlock).toString('base64')}`);
    });

    // Make message!
    let reply = `Here's your GMLive link${urls.length > 1 ? 's' : ''}, ${msg.author}:\n` +
                `${urls.join(', ')}\nTo run a GMLive snippet, open it in your browser and press "Run".`;

    // Make friends!
    msg.channel.send(reply);
  }
}
