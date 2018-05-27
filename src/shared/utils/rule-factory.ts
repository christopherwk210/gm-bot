import { Rule } from '..';
import { prefixedCommandRuleTemplate } from '../../config';
import { Emoji } from 'discord.js';

/**
 * Helper class to construct simple rules
 */
export class RuleFactory {
  /**
   * Creates a simple rule that responds to a message
   * @param matches Command matches
   * @param content Content to reply with
   * @param DM Reply to user via DM instead of channel, default false 
   * @param wholeMessage When true, sets exact to false and checks the whole message, default false
   */
  static createReplyRule(matches: string[], content: any, DM = false, wholeMessage = false): Rule {
    let rule: Rule = {
      matches,
      ...prefixedCommandRuleTemplate,
      action: DM ? msg => msg.author.send(content) : msg => msg.channel.send(content)
    };

    if (wholeMessage) {
      rule.wholeMessage = true;
      rule.exact = false;
    }

    return rule;
  }

  /**
   * Creates a simple rule that will react to a message
   * @param matches 
   * @param reactions 
   * @param wholeMessage When true, sets exact to false and checks the whole message, default false
   */
  static createReactionRule(matches: string[], reactions: (string|Emoji)[], wholeMessage = false): Rule {
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

    if (wholeMessage) {
      rule.wholeMessage = true;
      rule.exact = false;
    }

    return rule;
  }
}
