import { Message } from 'discord.js';
import { handleExplodeCommandMessages } from '../message-handlers/explode-handler.js';
import { handleHasteCodeBlockMessages } from '../message-handlers/haste-code-block.js';

export async function onMessageCreate(message: Message<boolean>) {
  if (message.author.bot) return;
  
  if (await handleExplodeCommandMessages(message)) return;
  await handleHasteCodeBlockMessages(message);
}
