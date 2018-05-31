import { ModifierOptions } from '..';

/**
 * Signifies a code block language modifier
 * @param modifierRuleOptions 
 */
export function Modifier(modifierRuleOptions: ModifierOptions) {
  return (constr: any) => {
    constr.prototype._rules = modifierRuleOptions;
  };
}
