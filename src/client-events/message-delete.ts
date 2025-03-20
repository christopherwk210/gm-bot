import { handleHelpChannelMessagesDelete } from '@/message-handlers/help-channel-handler.js';
import { Message, PartialMessage } from 'discord.js';

export async function onMessageDelete(message: Message<boolean> | PartialMessage) {  
  if (message.partial) {
    try {
      message = await message.fetch();
    } catch (error) {
      console.error('Something went wrong when fetching the message:', error);
      return;
    }
  }

  await handleHelpChannelMessagesDelete(message);
}