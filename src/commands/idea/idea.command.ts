import { Message, RichEmbed } from 'discord.js';
import { prefixedCommandRuleTemplate } from '../../config';
import { Command, CommandClass } from '../../shared';

import { generate } from './orteil-gamegen';

@Command({
  matches: ['idea', 'ideas'],
  ...prefixedCommandRuleTemplate
})
export class IdeaCommand implements CommandClass {
  /**
   * assigns birthday to someone
   * @param msg
   * @param args
   */
  action(msg: Message, args: string[]) {
    const insane = args.includes('insane');

    const idea = generate(insane);

    // Load in those saucy recources
    const embed = new RichEmbed ({
      title: `${insane ? 'Insane ' : ''}Game Idea: ${idea}`,
      description: `Video game generator by [Orteil](https://orteil.dashnet.org/gamegen) 2012`,
      footer: {
        text: `Executed by ${msg.member ? msg.member.displayName : msg.author.username}`
      },
      color: 0x76428a,
      timestamp: new Date()
    });

    msg.channel.send(embed);
  }
}
