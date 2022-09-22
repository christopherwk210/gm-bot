import { Message } from 'discord.js';
import { handleExplodeCommandMessages } from '../message-handlers/explode-handler.js';
import { handleHelpChannelMessages } from '../message-handlers/help-channel-handler.js';

export async function onMessageCreate(message: Message<boolean>) {
  handleExplodeCommandMessages(message);
  handleHelpChannelMessages(message);
}
