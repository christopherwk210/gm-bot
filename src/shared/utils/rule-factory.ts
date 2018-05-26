import { Rule } from '..';
import { prefixedCommandRuleTemplate } from '../../config';

/**
 * Helper class to help construct simple rules
 */
export class RuleFactory {
  /**
   * Creates a simple rule that responds with text
   * @param matches Command matches
   * @param text Text to reply with
   * @param DM Reply to user via DM instead of channel, default false 
   */
  static createTextRule(matches: string[], text: string, DM: boolean = false): Rule {
    let rule: Rule = {
      matches,
      ...prefixedCommandRuleTemplate,
      action: DM ? msg => msg.author.send(text) : msg => msg.channel.send(text)
    };

    return rule;
  }

  /**
   * Creates a simple
   * @param matches 
   * @param reactions 
   */
  static createReactionRule(matches: string[], reactions: string[]): Rule {
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
