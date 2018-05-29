import { ModifierOptions } from '..';

/**
 * Signifies a code block language modifier
 * @param modifierRuleOptions 
 */
export function Modifier(modifierRuleOptions: ModifierOptions) {
  return (constr: Function) => {
    constr.prototype._rules = modifierRuleOptions;
  }
}
