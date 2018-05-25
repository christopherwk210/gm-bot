let template = `
import { Message } from 'discord.js';
import { prefixedCommandRuleTemplate } from '../../config';
import { Command, CommandClass } from '../../shared';

@Command({
  matches: ['changelog'],
  ...prefixedCommandRuleTemplate
})
export class ChangelogCommand implements CommandClass {

  constructor() {
    
  }

  /**
   * 
   * @param msg 
   * @param args
   */
  action(msg: Message, args: string[]) {

  }
}
`
