import { Message, TextChannel } from 'discord.js';
import { serverIDs } from '../../config';
import { channelService, guildService } from '../../shared';
import { spamMessageCount, spamTimer } from '../../config';

interface SpamTracker {
  user: string;
  timestamp: Date;
  expires: Date;
  count: number;
  messages: Message[];
}

let spamTrackers: SpamTracker[] = [];

/**
 * Parses a modifier list against a discord message
 * @param msg Disord message to check for some basic spambots
 * @returns Nothing, honestly
 */
export function detectSpamMessage(msg: Message) {
  // Close your eyes, children
  const regKeywods: RegExp = /(?:nude|dick|date|pussie)s?|sex|dating|pussy|cum|naked|💋|👄|😘|👅/i;
  const regUrl: RegExp = /https?:\/\/\S+/i;
  if (regKeywods.test(msg.content) && regUrl.test(msg.content)) {
    addOrUpdateSpamTracker(msg);
  }
}

function getSecurityChannel(): TextChannel {
  return <any>channelService.getChannelByID(serverIDs.channels.dingusSecurityChannelID);
}

async function addOrUpdateSpamTracker(msg: Message) {
  const channel = getSecurityChannel();

  // Remove expired trackers first
  filterSpamTrackers();

  // Get the current tracker, if it exists
  const spamTracker = spamTrackers.find(tracker => tracker.user === msg.author.id);

  if (spamTracker) {
    spamTracker.count++;
    spamTracker.messages.push(msg);

    // Trigger if the user has sent configured amount of messages
    if (spamTracker.count >= spamMessageCount) {
      spamTracker.messages.forEach(message => {
        if (message.deletable) message.delete();
      });

      // Attempt to alert the user
      try {
        const author = msg.member || msg.author;
        if (author) {
          author.send(
            'Hello, this is an automated message. ' +
            'You have been kicked automatically from the GameMaker server due to triggering our automatic spam filter.\n\n' +
            'If you believe this was an error, you may rejoin the server.'
          );
        }
      } catch (e) {
        console.log(e);
        channel.send('Could not send user kick message, most likely due to being blocked.');
      }

      // Attempt to kick the user
      try {
        await msg.member.kick('User kicked automatically due to spam trigger.');
      } catch (e) {
        console.log(e);
        channel.send('Could not kick user!');
      }

      channel.send(`---\n**User has been kicked automatically. Details:**\n${getMarkdownDetails(msg)}`);
      return;
    }
  } else {
    spamTrackers.push(createSpamTracker(msg));
  }

  channel.send(`Suspicious message detected!\n${getMarkdownDetails(msg)}`);
}

function getMarkdownDetails(msg: Message) {
  return `User: <@${msg.author.id}>\n` +
         `Message: \`\`${msg.cleanContent}\`\`\n` +
         `Message Link: ${msg.url}`;
}

/**
 * Removes expired spam trackers from detection
 */
function filterSpamTrackers() {
  spamTrackers = spamTrackers.filter(tracker => new Date() < tracker.expires);
}

function createSpamTracker(msg: Message): SpamTracker {
  const timestamp = new Date();
  const expires = new Date();
  expires.setSeconds(expires.getSeconds() + spamTimer);

  return {
    user: msg.author.id,
    timestamp,
    expires,
    count: 1,
    messages: [msg]
  };
}
