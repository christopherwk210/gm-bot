import { Message } from 'discord.js';
import { reactions, ReactionHandler } from '../data/reactions.js';

export async function reactToMessage(message: Message<boolean>) {
  for (const handler of reactions) {
    // Single match
    if (typeof handler.match === 'string') {
      const found = await applyMatchString(message, handler.match, handler);
      if (found) break;
    }
    
    // Multiple matches
    else if (Array.isArray(handler.match)) {
      for (const match of handler.match) {
        const found = await applyMatchString(message, match, handler);
        if (found) break;
      }
    }
    
    // Function match
    else {
      if (handler.match(message)) {
        await applyEmoji(message, handler.emoji);
        break;
      }
    }
  }
}

async function applyMatchString(message: Message<boolean>, match: string, handler: ReactionHandler) {
  if (matchString(message.content, match, handler.wholeMessage)) {
    await applyEmoji(message, handler.emoji);
    return true;
  }

  return false;
}

function matchString(str: string, search: string, wholeMessage = false) {
  const fixedStr = str.toLowerCase().trim();
  const fixedSearch = search.toLowerCase().trim();

  if (!wholeMessage) return fixedStr.includes(fixedSearch);
  return fixedStr === fixedSearch;
}

async function applyEmoji(message: Message<boolean>, emoji: ReactionHandler['emoji']) {
  if (Array.isArray(emoji)) {
    for (const resolvable of emoji) {
      await message.react(resolvable).catch(() => {});
    }
  } else {
    await message.react(emoji).catch(() => {});
  }
}
