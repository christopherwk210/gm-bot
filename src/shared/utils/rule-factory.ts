import { Rule } from '..';
import { prefixedCommandRuleTemplate } from '../../config';
import { Emoji } from 'discord.js';

/**
 * Helper class to help construct simple rules
 */
export class RuleFactory {
  /**
   * Creates a simple rule that responds with text
   * @param matches Command matches
   * @param content Content to reply with
   * @param DM Reply to user via DM instead of channel, default false 
   */
  static createReplyRule(matches: string[], content: any, DM: boolean = false): Rule {
    let rule: Rule = {
      matches,
      ...prefixedCommandRuleTemplate,
      action: DM ? msg => msg.author.send(content) : msg => msg.channel.send(content)
    };

    return rule;
  }

  /**
   * Creates a simple
   * @param matches 
   * @param reactions 
   */
  static createReactionRule(matches: string[], reactions: (string|Emoji)[]): Rule {
    let rule: Rule = {
      matches,
      action: async msg => {
        for (let reaction of reactions) {
          try {
            await msg.react(reaction);
          } catch(e) {}
        }
      }
    };

    return rule;
  }
}
