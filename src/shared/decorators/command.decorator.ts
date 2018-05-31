import { RuleOptions } from '../interfaces/rule.interface';

/**
 * Signifies a message based command
 * @param commandRuleOptions All matching options for this command
 */
export function Command(commandRuleOptions: RuleOptions) {
  return (constr: any) => {
    constr.prototype._rules = commandRuleOptions;
  };
}
