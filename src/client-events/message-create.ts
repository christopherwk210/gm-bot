import { Message } from 'discord.js';
//import { handleExplodeCommandMessages } from '@/message-handlers/explode-handler.js';
import { handleGMLCodeBlockMessages } from '@/message-handlers/gml-formatter.js';
import { handleHasteCodeBlockMessages } from '@/message-handlers/haste-code-block.js';
import { reactToMessage } from '@/message-handlers/reaction-handler.js';
import { handleWrongCodeBlockMessages } from '@/message-handlers/wrong-code-block.js';
import { handleMisc } from '@/message-handlers/misc-handlers.js';
import { handleHelpChannelMessages } from '@/message-handlers/help-channel-handler.js';
import { handleHelpAnyDone } from '@/message-handlers/help-any-done-handler.js';

export async function onMessageCreate(message: Message<boolean>) {  
  if (message.partial) {
    try {
      message = await message.fetch();
    } catch (error) {
      console.error('Something went wrong when fetching the message:', error);
      return;
    }
  }

  if (message.author.bot) return;
  
  if (message.member && message.member.partial) {
    try {
      await message.member.fetch();
    } catch (error) {
      console.error('Something went wrong when fetching the member:', error);
      return;
    }
  }
  
  await handleHelpChannelMessages(message);
  //await handleExplodeCommandMessages(message);
  await handleHasteCodeBlockMessages(message);
  await handleWrongCodeBlockMessages(message);
  await handleGMLCodeBlockMessages(message);
  await reactToMessage(message);
  await handleMisc(message);
  await handleHelpAnyDone(message);
}
