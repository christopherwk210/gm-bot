import { Message } from 'discord.js';
import { handleExplodeCommandMessages } from '@/message-handlers/explode-handler.js';
import { handleHasteCodeBlockMessages } from '@/message-handlers/haste-code-block.js';
import { reactToMessage } from '@/message-handlers/reaction-handler.js';
import { handleWrongCodeBlockMessages } from '@/message-handlers/wrong-code-block.js';
import { handleMisc } from '@/message-handlers/misc-handlers.js';
import { handleHelpChannelMessages } from '@/message-handlers/help-channel-handler.js';

export async function onMessageCreate(message: Message<boolean>) {
  if (message.author.bot) return;
  
  await handleHelpChannelMessages(message);
  await handleExplodeCommandMessages(message);
  await handleHasteCodeBlockMessages(message);
  await handleWrongCodeBlockMessages(message);
  await reactToMessage(message);
  await handleMisc(message);
}
