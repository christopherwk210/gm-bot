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
  static createReplyRule(matches: string[], content: any, DM: boolean = false, wholeMessage: boolean = false): Rule {
    let rule: Rule = {
      matches,
      delete: true,
      action: DM ? msg => msg.author.send(content) : msg => msg.channel.send(content),
      prefix: wholeMessage ? '' : prefixedCommandRuleTemplate.prefix,
      position: 0
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
  static createReactionRule(matches: string[], reactions: (string | Emoji)[], wholeMessage = false): Rule {
    let rule: Rule = {
      matches,
      action: async msg => {
        if (msg.author.id === '227032791013916672') return;
        for (let reaction of reactions) {
          try {
            await msg.react(reaction);
          } catch (e) {}
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
