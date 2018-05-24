import { RichEmbed, Message, GuildMember, User } from 'discord.js';
import { prefixedCommandRuleTemplate, defaultEmbedColor } from '../../config';
import { Command, CommandClass, markdownService } from '../../shared';

@Command({
  matches: ['welcome'],
  ...prefixedCommandRuleTemplate
})
export class WelcomeCommand implements CommandClass {

  action(msg: Message) {
    WelcomeCommand.sendWelcomeMessage(msg.author);
  }

  /**
   * Send the server welcome message to the given user
   * @param user 
   */
  static sendWelcomeMessage(user: User | GuildMember) {
    // Get the welcome message contents
    let welcome = markdownService.files['welcome'];

    // Create a RichEmbed with the message
    let messageEmbed = new RichEmbed({
      color: defaultEmbedColor,
      description: welcome,
      timestamp: new Date(),
      footer: {
        text: 'This is an automated message'
      }
    });

    user.send(messageEmbed);
  }
}
