import { Message } from 'discord.js';
import { Modifier, ModifierClass, jsonService } from '../../shared';
import { js_beautify } from 'js-beautify';

@Modifier({
  match: 'clean-code',
  delete: true
})
export class CleanCodeModifier implements ModifierClass {
  /** Beautify rules as loaded from local JSON */
  beautifyOptions = jsonService.files['jsbeautify'];

  action(msg: Message, contents: string[], match: string) {
    let messageContent = msg.content;

    // Process all matching code blocks found and replace them
    contents.forEach(codeBlock => {
      let cleanedCode = js_beautify(codeBlock, this.beautifyOptions);
      messageContent = messageContent.replace(codeBlock, cleanedCode);
    });

    // Change clean-code to javascript to get some syntax highlighting
    let globalMatchRegExp = new RegExp(match, 'g');
    messageContent = messageContent.replace(globalMatchRegExp, 'javascript');

    // Clean code delivery service is a go
    msg.channel.send(`${msg.author}, here is your message with formatted code:\n${messageContent}`);
  }
}
