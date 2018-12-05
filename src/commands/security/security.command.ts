import { RichEmbed, Message, GuildMember, TextChannel } from 'discord.js';
import { prefixedCommandRuleTemplate, defaultEmbedColor, serverIDs } from '../../config';
import { Command, CommandClass, securityService, channelService, detectStaff } from '../../shared';

@Command({
  matches: ['security'],
  ...prefixedCommandRuleTemplate
})
export class SecurityCommand implements CommandClass {

  /**
   * Send the security message to the Dingus Ducks if necessary.
   * @param user
   */
  static newUserSecurity(user: GuildMember) {

    // Get our Security State
    const securityState = securityService.securityState;

    // If we ain't secure, then we outta here:
    if (!securityState) return;

    // Get our channel and send us off
    const dingusSecurity = SecurityCommand.getSecurityChannel();
    if (dingusSecurity) dingusSecurity.send(`${user.displayName}, tag: ${user} has joined.`);
  }

  static notifySecurityMode(user: GuildMember, state: boolean) {

    // Create a RichEmbed with the message
    const messageEmbed = new RichEmbed({
      color: defaultEmbedColor,
      description: `${user} has set security state: ${state}`,
      timestamp: new Date(),
      footer: {
        text: 'This is an automated message'
      }
    });

    // Get our channel and send us off
    const dingusSecurity = SecurityCommand.getSecurityChannel();
    if (dingusSecurity) dingusSecurity.send(messageEmbed);
  }

  static getSecurityChannel(): TextChannel {
    return <any>channelService.getChannelByID(serverIDs.channels.dingusSecurityChannelID);
  }

  /**
   * Send us into security mode and tell the Dinguses
   * that a new Dingus has arrived.
   * @param msg msg
   */
  action(msg: Message) {

    // Toggle Security
    securityService.toggleSecurityState();

    // Notify The Dinguses that Security has Changed
    SecurityCommand.notifySecurityMode(msg.member, securityService.securityState);
  }

  /**
   * Admin use only!
   * @param msg
   * @param args
   */
  pre(msg: Message, args: string[]) {
    return detectStaff(msg.member) === 'admin';
  }
}
