import { Message } from 'discord.js';
import { Modifier, ModifierClass } from '../../shared';
import * as Brainfuck from 'brainfuck-node';

@Modifier({
  match: 'brainfuck',
  delete: false
})
export class BrainfuckModifier implements ModifierClass {

  /**
   * Modifier action
   * @param msg Original discord message
   * @param contents Contents of all matched code blocks
   * @param match Modifier match string
   */
  action(msg: Message, contents: string[]) {
    const brainfuckScript = contents[0];

    if (brainfuckScript.includes(',')) {
      return msg.channel.send('GMBot is currently unable to handle the `,` command.');
    }

    if (/[^><\+-\.,\[\]]/g.test(brainfuckScript)) {
      return msg.channel.send('Invalid script detected, execution interrupted.');
    }

    const brainfuck = new Brainfuck();
    let result;

    try {
      result = brainfuck.execute(brainfuckScript);
    } catch (e) {
      msg.channel.send(`There was an issue executing your script.`);
      console.log(`Could not execute brainfuck: ${e}`);
      return;
    }

    if (result && result.output) {
      msg.channel.send(`Here's your script output ${msg.author}:\n\n\`\`\`\n${result.output}\n\`\`\``);
    }
  }
}
