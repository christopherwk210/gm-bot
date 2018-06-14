import { Message, Collection } from 'discord.js';
import { prefixedCommandRuleTemplate, defaultEmbedColor } from '../../config';
import { Command, CommandClass, detectStaff } from '../../shared';

@Command({
  matches: ['^', '+1', '-1'],
  prefix: '',
  position: 0,
  exact: true,
  delete: false,
  wholeMessage: true
})
export class UpvoteCommand implements CommandClass {
  /**
   * Upvotes message above
   * @param msg
   * @param args
   */
  async action(msg: Message, args: string[]) {
    let emoji = args[0] === '-1' ? '⬇' : '⬆';
    let fetchedMessages: Collection<string, Message>;

    try {
      fetchedMessages = await msg.channel.fetchMessages({ limit: 6 });
    } catch (e) {
      return console.log(e);
    }

    const messages = fetchedMessages.array();
    const found = messages.findIndex(message => message.id === msg.id);

    try {
      await (!!~found ? messages[found + 1] : messages[0]).react(emoji);
    } catch (e) {}

    msg.delete();
  }
}
