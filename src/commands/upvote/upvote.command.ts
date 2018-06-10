import { Message } from 'discord.js';
import { prefixedCommandRuleTemplate, defaultEmbedColor } from '../../config';
import { Command, CommandClass, detectStaff } from '../../shared';

@Command({
  matches: ['^'],
  prefix: '',
  position: 0,
  exact: true,
  delete: false
})
export class UpvoteCommand implements CommandClass {
    /**
     * Upvotes message above when user types "^"
     * @param msg
     * @param args
     */
    action(msg: Message, args: string[]) {
        if (args.length > 1 || args[0].length > 1) return;
        msg.channel.fetchMessages({ limit: 6 }).then(fetchedMessages => {
            let messages = fetchedMessages.array();
            for (let i = 0; i < messages.length - 1; i++) {
                if (messages[i].id === msg.id) {
                    messages[i + 1].react('⬆');
                    msg.delete();
                    return;
                }
            }
            messages[0].react('⬆');
            msg.delete();
        }).catch(err => console.log(err));
    }
}
