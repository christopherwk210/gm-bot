import { EmojiIdentifierResolvable, Message } from 'discord.js';

export interface ReactionHandler {
  match: string | string[] | ((message: Message<boolean>) => boolean);
  emoji: EmojiIdentifierResolvable | EmojiIdentifierResolvable[];
  wholeMessage?: boolean;
}

export const reactions: ReactionHandler[] = [
  // Wave hello to bot mentions
  {
    match: message => message.mentions.parsedUsers.has('1020014358283157584'),
    emoji: '👋'
  },

  // hmm's
  {
    match: 'mm',
    emoji: ['🇲', 'Ⓜ'],
    wholeMessage: true
  },
  {
    match: 'mmm',
    emoji: ['🇲', 'Ⓜ', '<:meseta:443515193801048085>'],
    wholeMessage: true
  },
  {
    match: 'hmm',
    emoji: ['🇭', '🇲', 'Ⓜ'],
    wholeMessage: true
  }
];
