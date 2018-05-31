import { Message } from 'discord.js';
import { prefixedCommandRuleTemplate } from '../../config';
import { Command, CommandClass, detectStaff } from '../../shared';
import { roleService } from '../../shared/services/role.service';

@Command({
  matches: ['assemble', 'quackquackquack'],
  ...prefixedCommandRuleTemplate
})
export class AssembleCommand implements CommandClass {
  /**
   * Ping the rubber duckies role
   * @param msg 
   * @param args
   */
  async action(msg: Message, args: string[]) {
    // Make sure this is in the server
    if ((msg.member) && (msg.member.roles)) {

      // Make sure nothing else was included with the message
      if (args.length === 1) {

        // If a guild is present (redundant)
        if (msg.guild) {

          // Grab the duck roles
          let ducks = roleService.getRoleByID('262926334118985728');
          let audio = roleService.getRoleByID('398875444360904704');
          let art = roleService.getRoleByID('345222078577901569');

          try {
            await ducks.setMentionable(true);
            await audio.setMentionable(true);
            await art.setMentionable(true);

            await msg.channel.send(`${ducks}, ${audio}, ${art}; Assemble!`);

            await ducks.setMentionable(false);
            await audio.setMentionable(false);
            await art.setMentionable(false);
          } catch (e) {
            console.log(`Error with assemble command: ${'\n'}${e}`);
          }
        }
      }
    }
  }

  /**
   * Command validation action
   * @param msg 
   * @param args
   */
  pre(msg: Message, args: string[]) {
    return !!detectStaff(msg.member);
  }
}
