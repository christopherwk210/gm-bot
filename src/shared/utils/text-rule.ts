import { Rule } from '..';
import { prefixedCommandRuleTemplate } from '../../config';

/**
 * Creates a simple rule that responds with text
 * @param matches Command matches
 * @param text Text to reply with
 * @param DM Reply to user via DM instead of channel, default false 
 */
export function createTextRule(matches: string[], text: string, DM: boolean = false): Rule {
  let rule: Rule = {
    matches,
    ...prefixedCommandRuleTemplate,
    action: DM ? msg => msg.author.send(text) : msg => msg.channel.send(text)
  };

  return rule;
}
