import { Message } from 'discord.js';
import { Modifier, ModifierClass } from '../../shared';

@Modifier({
  match: `(?<!\\S)('''|´´´)([^'´]|[^'´][\\s\\S]*?[^'´])\\1(?!\\S)`,
  usesCustomPattern: true,
  delete: true
})
export class WrongCodeModifier implements ModifierClass {
  async action(msg: Message, contents: string[], match: string) {
    // Format all misunderstood codeblocks
    let formatted = msg.content.replace(new RegExp(match, 'g'), '```js\n$2```');

    // Tell them what they did wrong, and fix it for them
    msg.channel.send(`<@${msg.author.id}>, you tried formatting your code with \`\`'''\`\` or \`\`´´´\`\`, ` +
      `however the correct symbol is the backtick: \`\` \`\`\` \`\`. Here is your message formatted properly:\n\n${formatted}`);
  }
}
