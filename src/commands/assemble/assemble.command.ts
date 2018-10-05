import { Message } from 'discord.js';
import { Command, CommandClass, roleService, detectStaff } from '../../shared';
import { prefixedCommandRuleTemplate, serverIDs } from '../../config';

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
    // Grab the duck roles
    let ducks = roleService.getRoleByID(serverIDs.duckycodeRoleID);
    let audio = roleService.getRoleByID(serverIDs.duckyaudioRoleID);
    let art = roleService.getRoleByID(serverIDs.duckyartRoleID);

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

  /**
   * Command validation action
   * @param msg
   * @param args
   */
  pre(msg: Message, args: string[]) {
    return !!detectStaff(msg.member);
  }
}
