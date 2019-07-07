import { Message } from 'discord.js';
import { Command, CommandClass, roleService, detectStaff } from '../../shared';
import { prefixedCommandRuleTemplate, serverIDs } from '../../config';

@Command({
  matches: ['podcast-ping'],
  ...prefixedCommandRuleTemplate
})
export class PodcastPing implements CommandClass {
  /**
   * Ping all the podcast losers
   * @param msg
   * @param args
   */
  async action(msg: Message, args: string[]) {
    let podcastRole = roleService.getRoleByID(serverIDs.roles.podcast);

    let time: string = '15';

    if (args[1]) {
      time = args[1];
    }

    try {
      await podcastRole.setMentionable(true);

      await msg.channel.send(
        `${podcastRole}: obj_podcast will be live in ${time} minutes!`
      );

      await podcastRole.setMentionable(false);
    } catch (e) {
      console.log(`Error with command: ${'\n'}${e}`);
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
